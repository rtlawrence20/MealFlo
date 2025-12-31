from datetime import date, timedelta

from app.extensions import db
from app.models.meal_plan_week import MealPlanWeek
from app.models.meal_group import MealGroup
from app.models.meal_group_recipe import MealGroupRecipe
from app.models.recipe import Recipe


MAX_RECIPES_PER_GROUP = 5


def _parse_iso_date(value: str) -> date:
    if not value:
        raise ValueError("Date is required")
    return date.fromisoformat(value)


def get_or_create_week(user_id: int, week_start_iso: str) -> MealPlanWeek:
    week_start = _parse_iso_date(week_start_iso)

    existing = MealPlanWeek.query.filter(
        MealPlanWeek.user_id == user_id,
        MealPlanWeek.week_start == week_start,
    ).first()

    if existing:
        return existing

    week = MealPlanWeek(user_id=user_id, week_start=week_start)
    db.session.add(week)
    db.session.commit()
    return week


def get_week_by_id(user_id: int, week_id: int) -> MealPlanWeek | None:
    return MealPlanWeek.query.filter(
        MealPlanWeek.id == week_id,
        MealPlanWeek.user_id == user_id,
    ).first()


def create_meal_group(user_id: int, payload: dict) -> MealGroup:
    week_id = payload.get("weekId")
    day_iso = payload.get("day")
    name = payload.get("name")

    if not week_id:
        raise ValueError("weekId is required")
    if not day_iso:
        raise ValueError("day is required")
    if not name:
        raise ValueError("name is required")

    week = get_week_by_id(user_id, int(week_id))
    if not week:
        raise ValueError("Week not found")

    day = _parse_iso_date(day_iso)

    group = MealGroup(
        week_id=week.id,
        day=day,
        name=name.strip(),
        sort_order=payload.get("sortOrder", 0),
    )
    db.session.add(group)
    db.session.commit()
    return group


def update_meal_group(user_id: int, group: MealGroup, payload: dict) -> MealGroup:
    # Ownership check: group belongs to a week belonging to the user
    week = get_week_by_id(user_id, group.week_id)
    if not week:
        raise ValueError("Week not found")

    if "name" in payload:
        group.name = payload["name"].strip()

    if "day" in payload:
        group.day = _parse_iso_date(payload["day"])

    if "sortOrder" in payload:
        group.sort_order = payload["sortOrder"]

    db.session.commit()
    return group


def delete_meal_group(user_id: int, group: MealGroup) -> None:
    week = get_week_by_id(user_id, group.week_id)
    if not week:
        raise ValueError("Week not found")

    db.session.delete(group)
    db.session.commit()


def add_recipe_to_group(
    user_id: int, group: MealGroup, payload: dict
) -> MealGroupRecipe:
    week = get_week_by_id(user_id, group.week_id)
    if not week:
        raise ValueError("Week not found")

    recipe_id = payload.get("recipeId")
    if not recipe_id:
        raise ValueError("recipeId is required")

    recipe = Recipe.query.filter(
        Recipe.id == int(recipe_id),
        Recipe.user_id == user_id,
    ).first()

    if not recipe:
        raise ValueError("Recipe not found")

    existing_count = MealGroupRecipe.query.filter(
        MealGroupRecipe.meal_group_id == group.id
    ).count()

    if existing_count >= MAX_RECIPES_PER_GROUP:
        raise ValueError(f"Meal group cannot exceed {MAX_RECIPES_PER_GROUP} recipes")

    planned_servings = payload.get("plannedServings", recipe.servings or 1)
    sort_order = payload.get("sortOrder", existing_count)

    group_recipe = MealGroupRecipe(
        meal_group_id=group.id,
        recipe_id=recipe.id,
        planned_servings=planned_servings,
        sort_order=sort_order,
    )
    db.session.add(group_recipe)
    db.session.commit()
    return group_recipe


def update_group_recipe(
    user_id: int, group_recipe: MealGroupRecipe, payload: dict
) -> MealGroupRecipe:
    # Verify ownership via week
    group = MealGroup.query.get(group_recipe.meal_group_id)
    if not group:
        raise ValueError("Meal group not found")

    week = get_week_by_id(user_id, group.week_id)
    if not week:
        raise ValueError("Week not found")

    if "plannedServings" in payload:
        group_recipe.planned_servings = payload["plannedServings"]

    if "sortOrder" in payload:
        group_recipe.sort_order = payload["sortOrder"]

    db.session.commit()
    return group_recipe


def delete_group_recipe(user_id: int, group_recipe: MealGroupRecipe) -> None:
    group = MealGroup.query.get(group_recipe.meal_group_id)
    if not group:
        raise ValueError("Meal group not found")

    week = get_week_by_id(user_id, group.week_id)
    if not week:
        raise ValueError("Week not found")

    db.session.delete(group_recipe)
    db.session.commit()
