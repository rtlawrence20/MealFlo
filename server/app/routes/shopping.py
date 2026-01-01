from flask import Blueprint, jsonify, request

from app.services.shopping_service import build_shopping_list_for_week

shopping_bp = Blueprint("shopping", __name__)

DEV_USER_ID = 1


@shopping_bp.get("/shopping-lists")
def get_shopping_list():
    """
    Query params:
      - weekId: int (required)
    """
    week_id = request.args.get("weekId")
    if not week_id:
        return jsonify({"error": "weekId is required"}), 400

    try:
        items = build_shopping_list_for_week(DEV_USER_ID, int(week_id))
        return jsonify({"weekId": int(week_id), "items": items})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
