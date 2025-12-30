from flask import Blueprint, jsonify, request

from app.services.recipes_service import (
    get_all_recipes,
    get_recipe_by_id,
    create_recipe,
    update_recipe,
    delete_recipe,
)

recipes_bp = Blueprint("recipes", __name__)

# TEMP: dev-only user stub
DEV_USER_ID = 1


@recipes_bp.get("/recipes")
def list_recipes():
    recipes = get_all_recipes(DEV_USER_ID)
    return jsonify([r.to_dict() for r in recipes])


@recipes_bp.get("/recipes/<int:recipe_id>")
def get_recipe(recipe_id: int):
    recipe = get_recipe_by_id(recipe_id, DEV_USER_ID)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify(recipe.to_dict(include_ingredients=True))


@recipes_bp.post("/recipes")
def create_recipe_route():
    try:
        recipe = create_recipe(DEV_USER_ID, request.get_json() or {})
        return jsonify(recipe.to_dict(include_ingredients=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@recipes_bp.patch("/recipes/<int:recipe_id>")
def update_recipe_route(recipe_id: int):
    recipe = get_recipe_by_id(recipe_id, DEV_USER_ID)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    recipe = update_recipe(recipe, request.get_json() or {})
    return jsonify(recipe.to_dict(include_ingredients=True))


@recipes_bp.delete("/recipes/<int:recipe_id>")
def delete_recipe_route(recipe_id: int):
    recipe = get_recipe_by_id(recipe_id, DEV_USER_ID)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    delete_recipe(recipe)
    return jsonify({"status": "deleted"})
