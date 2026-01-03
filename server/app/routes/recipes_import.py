from flask import Blueprint, jsonify, request, session

from app.services.csv_import_service import import_recipes_from_csv_text
from app.routes._auth_guard import login_required

recipes_import_bp = Blueprint("recipes_import", __name__)


@recipes_import_bp.post("/recipes/from-csv")
@login_required
def import_from_csv():
    user_id = session["user_id"]
    body = request.get_json() or {}
    csv_text = body.get("csvText")

    try:
        result = import_recipes_from_csv_text(user_id, csv_text)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
