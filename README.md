# webtest-automator

An AI-powered test automation tool for developers.  
It allows you to upload website context and describe test steps in plain language.  
The AI then generates Python scripts to execute those steps and reports progress/errors.

## 🚀 Features
- Upload context (HTML, routes, logs, etc.)
- Describe test steps in natural language
- AI generates Python scripts (using Playwright/Selenium)
- Progress tracking and error notifications
- Simple black-themed UI

## 📂 Project Structure
app/ # Main application code
ui/ # User interface
agent/ # AI agent (generator, executor, monitor)
scripts/ # Auto-generated scripts
utils/ # Helper functions
tests/ # Unit & integration tests
docs/ # Documentation


## 🛠 Installation
```bash
git clone https://github.com/Kodajonathan/webtest-automator.git
cd ai-agent-tester
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

▶️ Usage
```
python -m app.main
```
