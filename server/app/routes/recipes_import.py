from flask import Blueprint, jsonify, request

from app.services.csv_import_service import import_recipes_from_csv_text

recipes_import_bp = Blueprint("recipes_import", __name__)

DEV_USER_ID = 1


@recipes_import_bp.post("/recipes/from-csv")
def import_from_csv():
    body = request.get_json() or {}
    csv_text = body.get("csvText")

    try:
        result = import_recipes_from_csv_text(DEV_USER_ID, csv_text)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
