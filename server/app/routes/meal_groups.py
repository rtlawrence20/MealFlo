from math import log
from flask import Blueprint, jsonify, request, session

from app.models.meal_group import MealGroup
from app.services.meal_plans_service import (
    create_meal_group,
    update_meal_group,
    delete_meal_group,
)
from app.routes._auth_guard import login_required

meal_groups_bp = Blueprint("meal_groups", __name__)


@meal_groups_bp.post("/meal-groups")
@login_required
def create_group():
    user_id = session["user_id"]
    try:
        group = create_meal_group(user_id, request.get_json() or {})
        return jsonify(group.to_dict(include_recipes=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@meal_groups_bp.patch("/meal-groups/<int:group_id>")
@login_required
def patch_group(group_id: int):
    user_id = session["user_id"]
    group = MealGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Meal group not found"}), 404

    try:
        group = update_meal_group(user_id, group, request.get_json() or {})
        return jsonify(group.to_dict(include_recipes=True))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@meal_groups_bp.delete("/meal-groups/<int:group_id>")
@login_required
def remove_group(group_id: int):
    user_id = session["user_id"]
    group = MealGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Meal group not found"}), 404

    try:
        delete_meal_group(user_id, group)
        return jsonify({"status": "deleted"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
