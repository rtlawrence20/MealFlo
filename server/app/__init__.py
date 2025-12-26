import os

from flask import Flask
from dotenv import load_dotenv

from .extensions import db, migrate


def create_app() -> Flask:
    """
    App factory.
    Loads env, config, initializes extensions, registers blueprints.
    """
    load_dotenv()

    app = Flask(__name__, instance_relative_config=True)

    # Ensure instance folder exists for sqlite db
    os.makedirs(app.instance_path, exist_ok=True)

    # Config
    app.config.from_object("config.DevelopmentConfig")

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Blueprints
    from .routes.health import health_bp

    app.register_blueprint(health_bp, url_prefix="/api")

    return app
