from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    """
    Health check endpoint.

    Returns:
        { "status": "ok" }
    """
    return jsonify({"status": "ok"})
