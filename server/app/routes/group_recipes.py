from flask import Blueprint, jsonify, request

from app.models.meal_group import MealGroup
from app.models.meal_group_recipe import MealGroupRecipe
from app.services.meal_plans_service import (
    add_recipe_to_group,
    update_group_recipe,
    delete_group_recipe,
)

group_recipes_bp = Blueprint("group_recipes", __name__)

DEV_USER_ID = 1


@group_recipes_bp.post("/meal-groups/<int:group_id>/recipes")
def add_recipe(group_id: int):
    group = MealGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Meal group not found"}), 404

    try:
        gr = add_recipe_to_group(DEV_USER_ID, group, request.get_json() or {})
        return jsonify(gr.to_dict(include_recipe=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@group_recipes_bp.patch("/meal-group-recipes/<int:group_recipe_id>")
def patch_group_recipe(group_recipe_id: int):
    gr = MealGroupRecipe.query.get(group_recipe_id)
    if not gr:
        return jsonify({"error": "Meal group recipe not found"}), 404

    try:
        gr = update_group_recipe(DEV_USER_ID, gr, request.get_json() or {})
        return jsonify(gr.to_dict(include_recipe=True))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@group_recipes_bp.delete("/meal-group-recipes/<int:group_recipe_id>")
def remove_group_recipe(group_recipe_id: int):
    gr = MealGroupRecipe.query.get(group_recipe_id)
    if not gr:
        return jsonify({"error": "Meal group recipe not found"}), 404

    try:
        delete_group_recipe(DEV_USER_ID, gr)
        return jsonify({"status": "deleted"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
