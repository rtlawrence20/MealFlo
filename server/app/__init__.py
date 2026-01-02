import os

from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

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

    # Override the default sqlite path if using the default sqlite config
    if not app.config.get("SQLALCHEMY_DATABASE_URI") or app.config[
        "SQLALCHEMY_DATABASE_URI"
    ].startswith("sqlite:///instance/"):
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "DATABASE_URL",
            f"sqlite:///{os.path.join(app.instance_path, 'mealflo.db')}",
        )

    CORS(
        app,
        resources={
            r"/api/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173"]}
        },
    )

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    # from . import models  # noqa: F401

    # Blueprints
    from .routes.health import health_bp
    from .routes.recipes import recipes_bp
    from .routes.meal_plans import meal_plans_bp
    from .routes.meal_groups import meal_groups_bp
    from .routes.group_recipes import group_recipes_bp
    from .routes.shopping import shopping_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(recipes_bp, url_prefix="/api")
    app.register_blueprint(meal_plans_bp, url_prefix="/api")
    app.register_blueprint(meal_groups_bp, url_prefix="/api")
    app.register_blueprint(group_recipes_bp, url_prefix="/api")
    app.register_blueprint(shopping_bp, url_prefix="/api")

    return app
