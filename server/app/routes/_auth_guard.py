from functools import wraps
from flask import session, jsonify


def login_required(fn):
    """
    Require a valid session-based login.

    Security model:
    - User identity is managed via session, not tokens.
    - A request is considered authenticated if `session["user_id"]` exists.
    - Unauthorized requests receive a 401 response.
    - This protects API endpoints from unauthenticated access.

    Note:
    - Frontend route protection is separate; even if UI routes render, API data
      remains protected by this decorator.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)

    return wrapper
