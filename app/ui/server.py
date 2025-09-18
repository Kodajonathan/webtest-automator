# app/ui/server.py
from flask import Flask, render_template, request, jsonify
from app.utils.file_handler import save_uploaded_file,read_file_by_name,get_generated_scripts,load_config,save_config
from urllib.parse import urlparse
import os
import requests
from app.agent.generator import generate_code_script
app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route("/")
def home():
    # Renders the black-themed UI (index.html)
    return render_template("index.html")

@app.route("/api/get-config",methods=["POST"])
def get_configuration():
    try:
        config=load_config()
    except Exception as e:
        return jsonify({"message":f"An error occured while trying to fetch configuration: {e}"}), 400
    return jsonify({"message":"configuration fetched successfully","config":config}), 200

@app.route("/api/update-config",methods=["POST"])
def update_configuration():
    browser = request.form.get("browser", "").strip()
    if not browser:
        return jsonify({"message":"default browser is required"})
    
    timeout = request.form.get("timeout", "").strip()
    if not timeout:
        return jsonify({"message":"timeout number is required"})
    
    aiProvider = request.form.get("aiProvider", "").strip()
    if not aiProvider:
        return jsonify({"message":"please select an ai provider"})
    
    headlessMode = request.form.get("headlessMode", "").strip()
    if not browser:
        return jsonify({"message":"headless selection is required"})
    if headlessMode == "on":
        headlessMode=True
    else:
        headlessMode=False
    
    modelSelect = request.form.get("modelSelect", "").strip()
    if not modelSelect:
        return jsonify({"message":"model selection is required"})
    
    maxTokens = request.form.get("max-tokens", "").strip()
    if not maxTokens:
        return jsonify({"message":"please provide a max token value"})

    newConfig={
    "browser": browser,
    "headless": headlessMode,
    "ai_model":modelSelect,
    "timeout": timeout,
    "max_tokens": maxTokens
    }

    # save the new configuration
    try:
        save_config(newConfig)
    except Exception as e:
        return jsonify({f"An errro occured while saving the configuration: {e}"})

    return jsonify({"message":"configuration updated successfully"}),200


@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    try:
        filepath = save_uploaded_file(file, "")
        return jsonify({"message": f"File uploaded to {filepath}"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/check-status", methods=["GET"])
def check_status():
    return jsonify({"message":"success"}), 200

@app.route("/get-generated-scripts",methods=["POST"])
def get_python_scripts():
    scripts=get_generated_scripts()
    return jsonify({"message":"files retrieved successfully","scripts":scripts}),200

@app.route("/generate-script", methods=["POST"])
def generate_script_endpoint():
    """Validate input and call the generator; return structured errors on invalid input."""
    errors = []

    targetUrl = request.form.get("targetUrl", "").strip()
    testDescription = request.form.get("testdescription", "").strip()

    # Validate targetUrl
    if not targetUrl:
        errors.append("targetUrl is required")
    else:
        parsed = urlparse(targetUrl)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            errors.append("targetUrl must be a valid http(s) URL")

    # Validate description
    if not testDescription:
        errors.append("testdescription is required")
    elif len(testDescription) < 10:
        errors.append("testdescription must be at least 10 characters")

    if errors:
        return jsonify({"error": "invalid_input", "details": errors}), 400

    try:
        # Call the agent/generator (adjust args to match your API)
        # prompt="the target url is: ["+targetUrl+"] The user description for the test: ["+testDescription+"] The recoded Dom is: "+steps
        prompt="the target url is: ["+targetUrl+"] The user description for the automation is: ["+testDescription+"]"

        result = generate_code_script(prompt)
        return jsonify({"message": "Script has been generated successfully","generatedCode":result}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "generation_failed", "details": str(e)}), 500

@app.route("/api/groq-models", methods=["GET"])    
def get_groq_models():
    """Fetch Groq models server-side to keep API key secure"""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return jsonify({"error": "GROQ_API_KEY not configured"}), 500
        
        response = requests.get(
            "https://api.groq.com/openai/v1/models",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"API request failed: {response.status_code}"}), response.status_code
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500