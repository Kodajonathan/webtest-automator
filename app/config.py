import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    UPLOAD_FOLDER = os.path.join(basedir, '..', 'uploads')
    SCRIPTS_FOLDER = os.path.join(basedir, '..', 'scripts')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # optional, e.g. 16 MB
