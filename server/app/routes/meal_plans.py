from flask import Blueprint, jsonify, request

from app.services.meal_plans_service import get_or_create_week, get_week_by_id

meal_plans_bp = Blueprint("meal_plans", __name__)

DEV_USER_ID = 1


@meal_plans_bp.post("/meal-plans/weeks")
def create_or_get_week():
    body = request.get_json() or {}
    week_start = body.get("weekStart")
    try:
        week = get_or_create_week(DEV_USER_ID, week_start)
        return jsonify(week.to_dict(include_groups=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@meal_plans_bp.get("/meal-plans/weeks/<int:week_id>")
def get_week(week_id: int):
    week = get_week_by_id(DEV_USER_ID, week_id)
    if not week:
        return jsonify({"error": "Week not found"}), 404

    return jsonify(week.to_dict(include_groups=True))
