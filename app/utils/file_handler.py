import os,json
from werkzeug.utils import secure_filename
from flask import current_app, has_app_context
from pathlib import Path
from typing import Optional
import errno

ALLOWED_EXTENSIONS = {'py'}  # customize as needed

DEFAULT_CONFIG={
    "browser": "Chrome",
    "headless": True,
    "ai_model":"llama-3.1-8b-instant",
    "timeout": 60,
    "max_tokens": 1024
}

def _deep_merge(a: dict, b: dict) -> dict:
    """Return a new dict with b merged into a (deep merge)."""
    result = dict(a)
    for k, v in b.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = _deep_merge(result[k], v)
        else:
            result[k] = v
    return result

def load_config():
    """Load the configuration (deep-merge with DEFAULT_CONFIG)."""
    base_dir = os.environ.get("CONFIGURATIONS_FOLDER", "configs")
    # Resolve relative to project root for predictable location
    base_dir = str((Path(__file__).resolve().parents[2] / base_dir).resolve())
    CONFIG_PATH = os.path.join(base_dir, "config.json")

    try:
        os.makedirs(base_dir, exist_ok=True)
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                try:
                    user_cfg = json.load(f)
                except json.JSONDecodeError:
                    print(f"Warning: invalid JSON in {CONFIG_PATH}, using defaults")
                    return DEFAULT_CONFIG
            return _deep_merge(DEFAULT_CONFIG, user_cfg)
    except OSError as e:
        # non-fatal: log and fall back to defaults
        if e.errno != errno.EEXIST:
            print(f"Error creating configs directory {base_dir}: {e}")
    return DEFAULT_CONFIG

def save_config(new_config: dict):
    """Save new configuration settings atomically."""
    if not isinstance(new_config, dict):
        raise ValueError("new_config must be a dict")

    base_dir = os.environ.get("CONFIGURATIONS_FOLDER", "configs")
    base_dir = str((Path(__file__).resolve().parents[2] / base_dir).resolve())
    CONFIG_PATH = os.path.join(base_dir, "config.json")
    os.makedirs(base_dir, exist_ok=True)

    temp_path = CONFIG_PATH + ".tmp"
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(new_config, f, indent=4, ensure_ascii=False)
        os.replace(temp_path, CONFIG_PATH)
    except Exception as e:
        # Clean up temp file on failure
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
        raise

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file_storage, subdir: str = "") -> str:
    """
    Saves an uploaded file securely to the upload folder.
    Returns the saved filepath, or raises ValueError on invalid input.
    """
    if not file_storage or file_storage.filename == "":
        raise ValueError("No file provided or filename is empty")
    
    filename = secure_filename(file_storage.filename)
    if not allowed_file(filename):
        raise ValueError(f"File extension not allowed: {filename}")
    
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    target_dir = os.path.join(upload_folder, subdir)
    os.makedirs(target_dir, exist_ok=True)

    filepath = os.path.join(target_dir, filename)
    file_storage.save(filepath)

    return filepath

def read_file(filepath: str, mode="r", encoding="utf-8") -> str:
    """Read contents of a file safely."""
    with open(filepath, mode, encoding=encoding) as f:
        return f.read()

def delete_file(filepath: str) -> None:
    """Delete a file if it exists."""
    try:
        os.remove(filepath)
    except FileNotFoundError:
        pass
    
def get_file_Path(filename: str, base_folder: Optional[str] = None) -> str:
    """
    Resolve a safe absolute path for `filename` inside `base_folder`.
    - Secures filename to prevent directory traversal.
    - Validates allowed extension.
    - Uses Flask config or sensible defaults when base_folder is not provided.
    Raises ValueError or FileNotFoundError on error.
    """
    if not filename:
        raise ValueError("filename must be provided")

    safe_name = secure_filename(filename)
    if not safe_name:
        raise ValueError("Invalid filename after sanitization")

    if not allowed_file(safe_name):
        raise ValueError(f"File extension not allowed: {safe_name}")

    # Resolve base folder
    if base_folder:
        base_dir = base_folder
    elif has_app_context():
        # prefer scripts/uploads depending on use-case; keep flexible
        base_dir = current_app.config.get("UPLOAD_FOLDER", "uploads")
    else:
        base_dir = os.environ.get("UPLOAD_FOLDER") or str(Path(__file__).resolve().parents[2] / "uploads")

    target_dir = os.path.abspath(base_dir)
    os.makedirs(target_dir, exist_ok=True)

    abs_path = os.path.abspath(os.path.join(target_dir, safe_name))

    # Ensure resolved path is inside target_dir
    if not abs_path.startswith(target_dir + os.sep) and abs_path != target_dir:
        raise ValueError("Resolved path is outside the allowed directory")

    if not os.path.exists(abs_path):
        raise FileNotFoundError(f"File not found: {abs_path}")

    return abs_path

def read_file_by_name(filename: str, base_folder: Optional[str] = None, mode="r", encoding="utf-8") -> str:
    """
    Convenience: read a file by its filename (resolved via get_file_Path).
    Returns file content as string.
    """
    path = get_file_Path(filename, base_folder)
    return read_file(path, mode=mode, encoding=encoding)
    
def create_script_file(content: str, file_name: str, scripts_folder: Optional[str] = None) -> str:
    """
    Create or overwrite a python script file.
    - Uses Flask current_app config SCRIPTS_FOLDER when inside an app context.
    - Falls back to env var SCRIPTS_FOLDER or a 'scripts' folder in the project root when outside an app context.
    Returns the full filepath of the created file.
    Raises ValueError on invalid input.
    """
    if not file_name or not content:
        raise ValueError("File name and content must be provided")

    # Ensure .py extension
    if not file_name.lower().endswith(".py"):
        file_name = f"{file_name}.py"

    # Validate extension
    if not allowed_file(file_name):
        raise ValueError(f"File extension not allowed: {file_name}")

    # Resolve target scripts folder
    if scripts_folder:
        base_dir = scripts_folder
    elif has_app_context():
        base_dir = current_app.config.get("SCRIPTS_FOLDER", "scripts")
    else:
        # fallback: use env var or project-root/scripts
        base_dir = os.environ.get("SCRIPTS_FOLDER") or str(Path(__file__).resolve().parents[2] / "scripts")

    target_dir = os.path.abspath(base_dir)
    os.makedirs(target_dir, exist_ok=True)

    filepath = os.path.join(target_dir, secure_filename(file_name))

    # Write atomically (temp -> replace)
    temp_path = filepath + ".tmp"
    with open(temp_path, "w", encoding="utf-8") as fh:
        fh.write(content)
    os.replace(temp_path, filepath)

    return filepath

def get_generated_scripts():
    """
    Get a list of all generated Python script files from the scripts folder.
    Returns a list of dictionaries with script metadata.
    """
    try:
        # Resolve scripts folder
        if has_app_context():
            base_dir = current_app.config.get("SCRIPTS_FOLDER", "scripts")
        else:
            base_dir = os.environ.get("SCRIPTS_FOLDER") or str(Path(__file__).resolve().parents[2] / "scripts")

        target_dir = os.path.abspath(base_dir)
        
        # Create directory if it doesn't exist
        os.makedirs(target_dir, exist_ok=True)
        
        scripts = []
        
        # Get all .py files in the scripts directory
        for filename in os.listdir(target_dir):
            if filename.endswith('.py') and not filename.startswith('.'):
                filepath = os.path.join(target_dir, filename)
                
                # Get file stats
                stat = os.stat(filepath)
                
                scripts.append({
                    'filename': filename,
                    'filepath': filepath,
                    'size': stat.st_size,
                    'created': stat.st_ctime,
                    'modified': stat.st_mtime,
                    'size_kb': round(stat.st_size / 1024, 2)
                })
        
        # Sort by modification time (newest first)
        scripts.sort(key=lambda x: x['modified'], reverse=True)
        
        return scripts
        
    except Exception as e:
        print(f"Error getting generated scripts: {e}")
        return []