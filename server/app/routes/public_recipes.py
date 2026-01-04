from flask import Blueprint, jsonify
from sqlalchemy.orm import joinedload

from app.models.recipe import Recipe

public_recipes_bp = Blueprint("public_recipes", __name__)


@public_recipes_bp.get("/public/recipes")
def list_public_recipes():
    recipes = (
        Recipe.query.filter(Recipe.is_public.is_(True))
        .order_by(Recipe.updated_at.desc())
        .limit(50)
        .all()
    )
    return jsonify([r.to_dict() for r in recipes])


@public_recipes_bp.get("/public/recipes/<int:recipe_id>")
def get_public_recipe(recipe_id: int):
    recipe = (
        Recipe.query.filter(Recipe.id == recipe_id, Recipe.is_public.is_(True))
        .options(joinedload(Recipe.ingredients))
        .first_or_404()
    )
    return jsonify(recipe.to_dict(include_ingredients=True))
