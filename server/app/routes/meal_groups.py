from flask import Blueprint, jsonify, request

from app.models.meal_group import MealGroup
from app.services.meal_plans_service import (
    create_meal_group,
    update_meal_group,
    delete_meal_group,
)

meal_groups_bp = Blueprint("meal_groups", __name__)

DEV_USER_ID = 1


@meal_groups_bp.post("/meal-groups")
def create_group():
    try:
        group = create_meal_group(DEV_USER_ID, request.get_json() or {})
        return jsonify(group.to_dict(include_recipes=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@meal_groups_bp.patch("/meal-groups/<int:group_id>")
def patch_group(group_id: int):
    group = MealGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Meal group not found"}), 404

    try:
        group = update_meal_group(DEV_USER_ID, group, request.get_json() or {})
        return jsonify(group.to_dict(include_recipes=True))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@meal_groups_bp.delete("/meal-groups/<int:group_id>")
def remove_group(group_id: int):
    group = MealGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Meal group not found"}), 404

    try:
        delete_meal_group(DEV_USER_ID, group)
        return jsonify({"status": "deleted"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
