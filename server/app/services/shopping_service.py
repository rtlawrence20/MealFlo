from collections import defaultdict

from app.models.meal_plan_week import MealPlanWeek
from app.models.meal_group_recipe import MealGroupRecipe
from app.models.recipe import Recipe


def _key(name: str, unit: str | None) -> tuple[str, str | None]:
    return (name.strip().lower(), unit.strip().lower() if unit else None)


def build_shopping_list_for_week(user_id: int, week_id: int) -> list[dict]:
    """
    Aggregate ingredients for all recipes planned in a week.

    MVP behavior:
      - Sums by (ingredient name, unit)
      - Ignores serving scaling initially (we can add scaling as polish)
    """
    week = MealPlanWeek.query.filter(
        MealPlanWeek.id == week_id,
        MealPlanWeek.user_id == user_id,
    ).first()

    if not week:
        raise ValueError("Week not found")

    # Collect group recipe placements
    placements = (
        MealGroupRecipe.query.join(Recipe, MealGroupRecipe.recipe_id == Recipe.id)
        .filter(Recipe.user_id == user_id)
        .all()
    )

    # Filter placements to only this week via meal_groups relationship
    # Avoid importing MealGroup at module import time; use relationship traversal.
    placements = [
        p for p in placements if p.meal_group and p.meal_group.week_id == week_id
    ]

    totals = defaultdict(float)
    meta = {}

    for placement in placements:
        recipe = placement.recipe
        if not recipe:
            continue

        for ing in recipe.ingredients:
            name = ing.name or ""
            if not name.strip():
                continue

            unit = ing.unit
            qty = ing.quantity if ing.quantity is not None else 0.0

            k = _key(name, unit)
            totals[k] += float(qty)
            meta[k] = {
                "name": ing.name.strip(),
                "unit": ing.unit,
            }

    # Build list output
    items = []
    for k, total_qty in totals.items():
        items.append(
            {
                "name": meta[k]["name"],
                "unit": meta[k]["unit"],
                "quantity": round(total_qty, 3),
            }
        )

    # Stable sort: name then unit
    items.sort(key=lambda x: (x["name"].lower(), (x["unit"] or "").lower()))
    return items
