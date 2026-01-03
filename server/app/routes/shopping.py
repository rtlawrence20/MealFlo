from flask import Blueprint, jsonify, request, session

from app.services.shopping_service import build_shopping_list_for_week
from app.routes._auth_guard import login_required

shopping_bp = Blueprint("shopping", __name__)


@shopping_bp.get("/shopping-lists")
@login_required
def get_shopping_list():
    """
    Query params:
      - weekId: int (required)
    """
    user_id = session["user_id"]
    week_id = request.args.get("weekId")
    if not week_id:
        return jsonify({"error": "weekId is required"}), 400

    try:
        items = build_shopping_list_for_week(user_id, int(week_id))
        return jsonify({"weekId": int(week_id), "items": items})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
