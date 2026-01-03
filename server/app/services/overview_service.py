from datetime import date
from sqlalchemy.orm import joinedload

from app.models.meal_group import MealGroup
from app.models.meal_group_recipe import MealGroupRecipe
from app.models.recipe import Recipe


def get_today_overview(user_id: int, target_date: date | None = None):
    """
    Return today's meal groups with recipes (including instructions).
    """
    target_date = target_date or date.today()

    groups = (
        MealGroup.query.join(MealGroup.week)
        .filter(
            MealGroup.day == target_date,
            MealGroup.week.has(user_id=user_id),
        )
        .options(
            joinedload(MealGroup.group_recipes)
            .joinedload(MealGroupRecipe.recipe)
            .joinedload(Recipe.ingredients)
        )
        .order_by(MealGroup.sort_order.asc())
        .all()
    )

    payload_groups = []
    for g in groups:
        group_dict = g.to_dict(include_recipes=True)
        normalized = []
        for gr in group_dict.get("recipes", []):
            recipe = gr.get("recipe")
            if recipe:
                recipe_id = gr.get("recipeId") or recipe.get("id")
                orm_recipe = None
                for ogr in g.group_recipes:
                    if ogr.recipe_id == recipe_id:
                        orm_recipe = ogr.recipe
                        break

                if orm_recipe:
                    gr["recipe"] = orm_recipe.to_dict(include_ingredients=True)

            normalized.append(gr)

        group_dict["recipes"] = normalized
        payload_groups.append(group_dict)

    return {
        "date": target_date.isoformat(),
        "mealGroups": payload_groups,
    }
