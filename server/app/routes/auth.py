"""
Auth API (session-based)

Key invariants:
- username is normalized (trimmed + lowercased) at the API boundary.
- Successful signup/login sets `session["user_id"]`.
- `/me` is the source of truth for session validity; stale sessions are cleared.
- Sessions persist until logout or invalidation (cookie cleared / secret changes).
"""

from flask import Blueprint, request, jsonify, session
from sqlalchemy.exc import IntegrityError

from ..extensions import db, bcrypt
from ..models import User

auth_bp = Blueprint(
    "auth",
    __name__,
)


def _normalize_username(username: str) -> str:
    """Helper to normalize username addresses."""
    return (username or "").strip().lower()


@auth_bp.post("/signup")
def signup():
    """
    Sign up a new user with username and password.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request body"}), 400

    username = _normalize_username(data.get("username"))
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 422

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(username=username, password_hash=password_hash)
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "username already exists"}), 409

    session["user_id"] = user.id
    return jsonify({"id": user.id, "username": user.username}), 201


@auth_bp.post("/login")
def login():
    """
    Log in a user with username and password.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request body"}), 400

    username = _normalize_username(data.get("username"))
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 422

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["user_id"] = user.id
    return jsonify({"id": user.id, "username": user.username}), 200


@auth_bp.get("/me")
def me():
    """
    Get the currently logged-in user's info.
    """
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(user_id)
    if not user:
        # If a session references a user that no longer exists, clear it.
        # Force client to re-authenticate.
        session.clear()
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"id": user.id, "username": user.username}), 200


@auth_bp.delete("/logout")
def logout():
    """
    Log out the current user.
    """
    session.clear()
    return jsonify({"status": "ok"}), 200
