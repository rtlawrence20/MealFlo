from flask import Blueprint, jsonify, request, session
from app.extensions import db
from app.models.recipe import Recipe
from app.routes._auth_guard import login_required

from app.services.recipes_service import (
    get_all_recipes,
    get_recipe_by_id,
    create_recipe,
    update_recipe,
    delete_recipe,
)

recipes_bp = Blueprint("recipes", __name__)


@recipes_bp.get("/recipes")
@login_required
def list_recipes():
    user_id = session["user_id"]
    recipes = get_all_recipes(user_id)
    return jsonify([r.to_dict() for r in recipes])


@recipes_bp.get("/recipes/<int:recipe_id>")
@login_required
def get_recipe(recipe_id: int):
    user_id = session["user_id"]
    recipe = get_recipe_by_id(recipe_id, user_id)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify(recipe.to_dict(include_ingredients=True))


@recipes_bp.post("/recipes")
@login_required
def create_recipe_route():
    user_id = session["user_id"]
    try:
        recipe = create_recipe(user_id, request.get_json() or {})
        return jsonify(recipe.to_dict(include_ingredients=True)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@recipes_bp.patch("/recipes/<int:recipe_id>")
@login_required
def update_recipe_route(recipe_id: int):
    user_id = session["user_id"]
    recipe = get_recipe_by_id(recipe_id, user_id)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    recipe = update_recipe(recipe, request.get_json() or {})
    return jsonify(recipe.to_dict(include_ingredients=True))


@recipes_bp.delete("/recipes/<int:recipe_id>")
@login_required
def delete_recipe_route(recipe_id: int):
    user_id = session["user_id"]
    recipe = get_recipe_by_id(recipe_id, user_id)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    delete_recipe(recipe)
    return jsonify({"status": "deleted"})


@recipes_bp.post("/recipes/<int:recipe_id>/publish")
@login_required
def publish_recipe(recipe_id: int):
    user_id = session["user_id"]
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first_or_404()
    recipe.is_public = True
    db.session.commit()
    return jsonify(recipe.to_dict())


@recipes_bp.post("/recipes/<int:recipe_id>/unpublish")
@login_required
def unpublish_recipe(recipe_id: int):
    user_id = session["user_id"]
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first_or_404()
    recipe.is_public = False
    db.session.commit()
    return jsonify(recipe.to_dict())
