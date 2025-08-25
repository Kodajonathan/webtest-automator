# app/ui/server.py
from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder="templates", static_folder="static")

# create directory for user uploads
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    # Renders the black-themed UI (index.html)
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    return jsonify({"message": f"File {file.filename} uploaded successfully!"})

@app.route("/steps", methods=["POST"])
def process_steps():
    data = request.json
    steps = data.get("steps", "")
    # Later: pass steps to AI agent
    print("User steps:", steps)
    return jsonify({"message": "Steps received", "steps": steps})
