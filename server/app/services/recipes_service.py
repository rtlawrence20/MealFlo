from typing import List

from app.extensions import db
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient


def get_all_recipes(user_id: int) -> List[Recipe]:
    return (
        Recipe.query.filter(Recipe.user_id == user_id)
        .order_by(Recipe.created_at.desc())
        .all()
    )


def get_recipe_by_id(recipe_id: int, user_id: int) -> Recipe | None:
    return Recipe.query.filter(
        Recipe.id == recipe_id,
        Recipe.user_id == user_id,
    ).first()


def create_recipe(user_id: int, payload: dict) -> Recipe:
    title = payload.get("title")
    if not title:
        raise ValueError("Recipe title is required")

    servings = payload.get("servings", 1)
    ingredients = payload.get("ingredients", [])

    recipe = Recipe(
        user_id=user_id,
        title=title.strip(),
        description=payload.get("description"),
        servings=servings,
    )

    for idx, ing in enumerate(ingredients):
        recipe.ingredients.append(
            RecipeIngredient(
                name=ing["name"].strip(),
                quantity=ing.get("quantity"),
                unit=ing.get("unit"),
                notes=ing.get("notes"),
                sort_order=idx,
            )
        )

    db.session.add(recipe)
    db.session.commit()
    return recipe


def update_recipe(recipe: Recipe, payload: dict) -> Recipe:
    if "title" in payload:
        recipe.title = payload["title"].strip()

    if "description" in payload:
        recipe.description = payload["description"]

    if "servings" in payload:
        recipe.servings = payload["servings"]

    if "ingredients" in payload:
        recipe.ingredients.clear()
        for idx, ing in enumerate(payload["ingredients"]):
            recipe.ingredients.append(
                RecipeIngredient(
                    name=ing["name"].strip(),
                    quantity=ing.get("quantity"),
                    unit=ing.get("unit"),
                    notes=ing.get("notes"),
                    sort_order=idx,
                )
            )

    db.session.commit()
    return recipe


def delete_recipe(recipe: Recipe) -> None:
    db.session.delete(recipe)
    db.session.commit()
