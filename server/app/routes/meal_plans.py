from flask import Blueprint, jsonify, request, session

from app.services.meal_plans_service import get_or_create_week, get_week_by_id
from app.services.meal_plans_service import copy_week
from app.routes._auth_guard import login_required

meal_plans_bp = Blueprint("meal_plans", __name__)


@meal_plans_bp.post("/meal-plans/weeks")
@login_required
def create_or_get_week():
    user_id = session["user_id"]
    body = request.get_json() or {}
    week_start = body.get("weekStart")
    try:
        week = get_or_create_week(user_id, week_start)
        return jsonify(week.to_dict(include_groups=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@meal_plans_bp.get("/meal-plans/weeks/<int:week_id>")
@login_required
def get_week(week_id: int):
    user_id = session["user_id"]
    week = get_week_by_id(user_id, week_id)
    if not week:
        return jsonify({"error": "Week not found"}), 404

    return jsonify(week.to_dict(include_groups=True))


@meal_plans_bp.post("/meal-plans/weeks/<int:week_id>/copy")
@login_required
def copy_week_route(week_id: int):
    user_id = session["user_id"]
    body = request.get_json() or {}
    week_start = body.get("weekStart")
    try:
        target = copy_week(user_id, week_id, week_start)
        return jsonify(target.to_dict(include_groups=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
