# app/main.py
from app.ui.server import app

# this is the app entry point
if __name__ == "__main__":
    app.run(debug=True)