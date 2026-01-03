from datetime import date
from sqlalchemy.orm import joinedload

from app.models.meal_group import MealGroup
from app.models.meal_group_recipe import MealGroupRecipe


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
        .options(joinedload(MealGroup.group_recipes).joinedload(MealGroupRecipe.recipe))
        .order_by(MealGroup.sort_order.asc())
        .all()
    )

    return {
        "date": target_date.isoformat(),
        "mealGroups": [g.to_dict(include_recipes=True) for g in groups],
    }
