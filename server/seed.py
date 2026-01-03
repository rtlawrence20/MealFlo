from __future__ import annotations

from datetime import date, timedelta

from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.meal_plan_week import MealPlanWeek
from app.models.meal_group import MealGroup
from app.models.meal_group_recipe import MealGroupRecipe


def _week_start_for(d: date) -> date:
    """Return Monday for the week containing d."""
    return d - timedelta(days=d.weekday())


def _create_user(username: str, password: str) -> User:
    user = User(
        username=username.strip().lower(),
        password_hash=bcrypt.generate_password_hash(password).decode("utf-8"),
    )
    db.session.add(user)
    db.session.flush()
    return user


def _create_recipe(
    *,
    user_id: int,
    title: str,
    description: str | None,
    servings: int,
    prep_min: int | None,
    cook_min: int | None,
    instructions: str | None,
    notes: str | None,
    ingredients: list[tuple[str, float | None, str | None, str | None]],
) -> Recipe:
    recipe = Recipe(
        user_id=user_id,
        title=title,
        description=description,
        servings=servings,
        prep_min=prep_min,
        cook_min=cook_min,
        instructions=instructions,
        notes=notes,
    )

    for idx, (name, qty, unit, ing_notes) in enumerate(ingredients):
        recipe.ingredients.append(
            RecipeIngredient(
                name=name,
                quantity=qty,
                unit=unit,
                notes=ing_notes,
                sort_order=idx,
            )
        )

    db.session.add(recipe)
    db.session.flush()
    return recipe


def run():
    app = create_app()

    with app.app_context():
        print("Seeding database...")

        # WARNING: destructive. Intended for local development only.
        db.drop_all()
        db.create_all()

        # --- Demo user ---
        user = _create_user("demo", "password")

        # --- 9 recipes (3 breakfast / 3 lunch / 3 dinner) ---
        breakfasts = [
            _create_recipe(
                user_id=user.id,
                title="Overnight Oats",
                description="No-cook oats you can prep the night before.",
                servings=1,
                prep_min=5,
                cook_min=None,
                instructions=(
                    "1. Add oats, milk, and chia seeds to a jar.\n"
                    "2. Stir well and refrigerate overnight.\n"
                    "3. Top with fruit and a drizzle of honey."
                ),
                notes="Swap milk for almond milk if desired.",
                ingredients=[
                    ("Rolled oats", 0.5, "cup", None),
                    ("Milk", 0.5, "cup", "any kind"),
                    ("Chia seeds", 1.0, "tbsp", None),
                    ("Banana", 1.0, None, "sliced"),
                    ("Honey", 1.0, "tsp", "optional"),
                ],
            ),
            _create_recipe(
                user_id=user.id,
                title="Avocado Toast",
                description="Fast breakfast with a savory bite.",
                servings=1,
                prep_min=5,
                cook_min=3,
                instructions=(
                    "1. Toast bread.\n"
                    "2. Mash avocado with salt and lemon.\n"
                    "3. Spread on toast and top with pepper."
                ),
                notes="Optional: add a fried egg.",
                ingredients=[
                    ("Bread", 2.0, "slice", None),
                    ("Avocado", 1.0, None, None),
                    ("Lemon juice", 1.0, "tsp", None),
                    ("Salt", None, None, "to taste"),
                    ("Black pepper", None, None, "to taste"),
                ],
            ),
            _create_recipe(
                user_id=user.id,
                title="Greek Yogurt Parfait",
                description="Protein-forward parfait with fruit.",
                servings=1,
                prep_min=5,
                cook_min=None,
                instructions=(
                    "1. Layer yogurt, granola, and berries in a bowl.\n"
                    "2. Finish with honey."
                ),
                notes="Use frozen berries if needed.",
                ingredients=[
                    ("Greek yogurt", 1.0, "cup", None),
                    ("Granola", 0.25, "cup", None),
                    ("Mixed berries", 0.5, "cup", None),
                    ("Honey", 1.0, "tsp", "optional"),
                ],
            ),
        ]

        lunches = [
            _create_recipe(
                user_id=user.id,
                title="Turkey Sandwich",
                description="Classic lunch sandwich.",
                servings=1,
                prep_min=7,
                cook_min=None,
                instructions=(
                    "1. Assemble turkey, cheese, and greens on bread.\n"
                    "2. Add mustard or mayo.\n"
                    "3. Slice and serve."
                ),
                notes="Add tomato if you like.",
                ingredients=[
                    ("Bread", 2.0, "slice", None),
                    ("Turkey", 4.0, "oz", None),
                    ("Cheddar", 1.0, "slice", None),
                    ("Lettuce", 2.0, "leaf", None),
                    ("Mustard", 1.0, "tsp", "optional"),
                ],
            ),
            _create_recipe(
                user_id=user.id,
                title="Chicken Salad Bowl",
                description="Quick salad with protein.",
                servings=1,
                prep_min=10,
                cook_min=None,
                instructions=(
                    "1. Chop veggies.\n"
                    "2. Toss with greens and chicken.\n"
                    "3. Dress and serve."
                ),
                notes="Use rotisserie chicken to save time.",
                ingredients=[
                    ("Mixed greens", 2.0, "cup", None),
                    ("Cooked chicken", 4.0, "oz", None),
                    ("Cucumber", 0.5, None, "sliced"),
                    ("Cherry tomatoes", 0.5, "cup", None),
                    ("Olive oil", 1.0, "tbsp", None),
                ],
            ),
            _create_recipe(
                user_id=user.id,
                title="Veggie Wrap",
                description="Crunchy veggie wrap with hummus.",
                servings=1,
                prep_min=10,
                cook_min=None,
                instructions=(
                    "1. Spread hummus on tortilla.\n"
                    "2. Add veggies.\n"
                    "3. Roll tightly and slice."
                ),
                notes="Add feta for extra flavor.",
                ingredients=[
                    ("Tortilla", 1.0, None, None),
                    ("Hummus", 2.0, "tbsp", None),
                    ("Bell pepper", 0.5, None, "sliced"),
                    ("Carrot", 1.0, None, "shredded"),
                    ("Spinach", 1.0, "cup", None),
                ],
            ),
        ]

        dinners = [
            _create_recipe(
                user_id=user.id,
                title="Simple Pasta",
                description="Quick weeknight pasta.",
                servings=2,
                prep_min=10,
                cook_min=20,
                instructions=(
                    "1. Bring a large pot of salted water to a boil.\n"
                    "2. Cook pasta until al dente.\n"
                    "3. Reserve 1/2 cup pasta water.\n"
                    "4. Toss pasta with sauce and reserved water.\n"
                    "5. Serve immediately."
                ),
                notes="Use gluten-free pasta if needed.",
                ingredients=[
                    ("Pasta", 8.0, "oz", None),
                    ("Marinara sauce", 1.0, "cup", None),
                    ("Parmesan", 0.25, "cup", "optional"),
                    ("Salt", None, None, "to taste"),
                ],
            ),
            _create_recipe(
                user_id=user.id,
                title="Chicken Tacos",
                description="Easy skillet tacos.",
                servings=3,
                prep_min=15,
                cook_min=15,
                instructions=(
                    "1. Season chicken with spices.\n"
                    "2. Cook in skillet until browned.\n"
                    "3. Warm tortillas.\n"
                    "4. Assemble tacos with toppings."
                ),
                notes="Great with lime crema.",
                ingredients=[
                    ("Chicken", 1.0, "lb", None),
                    ("Tortillas", 6.0, None, None),
                    ("Taco seasoning", 2.0, "tbsp", None),
                    ("Onion", 0.5, None, "diced"),
                    ("Lime", 1.0, None, "optional"),
                ],
            ),
            _create_recipe(
                user_id=user.id,
                title="Stir-Fry Rice Bowl",
                description="Fast stir-fry over rice.",
                servings=2,
                prep_min=10,
                cook_min=15,
                instructions=(
                    "1. Cook rice (or use leftover).\n"
                    "2. Stir-fry veggies until crisp-tender.\n"
                    "3. Add protein and sauce.\n"
                    "4. Serve over rice."
                ),
                notes="Use frozen veggie mix if short on time.",
                ingredients=[
                    ("Rice", 1.0, "cup", "uncooked"),
                    ("Mixed vegetables", 2.0, "cup", None),
                    ("Soy sauce", 2.0, "tbsp", None),
                    ("Garlic", 2.0, "clove", "minced"),
                    ("Egg", 2.0, None, "optional"),
                ],
            ),
        ]

        # --- Create a week plan covering 7 days ---
        today = date.today()
        week_start = _week_start_for(today)

        week = MealPlanWeek(user_id=user.id, week_start=week_start)
        db.session.add(week)
        db.session.flush()

        # Create meal groups for each day: Breakfast / Lunch / Dinner
        # and rotate through the available recipes so the entire week is populated.
        meal_names = ["Breakfast", "Lunch", "Dinner"]
        pools = [breakfasts, lunches, dinners]

        for offset in range(7):
            day = week_start + timedelta(days=offset)
            for sort_order, (meal_name, pool) in enumerate(zip(meal_names, pools)):
                group = MealGroup(
                    week_id=week.id,
                    day=day,
                    name=meal_name,
                    sort_order=sort_order,
                )
                db.session.add(group)
                db.session.flush()

                recipe = pool[offset % len(pool)]
                db.session.add(
                    MealGroupRecipe(
                        meal_group_id=group.id,
                        recipe_id=recipe.id,
                        planned_servings=recipe.servings or 1,
                        sort_order=0,
                    )
                )

        db.session.commit()

        print("Seed complete.")
        print("Login with: username: demo / password: password")
        print(f"Seeded week_start: {week_start.isoformat()}")


if __name__ == "__main__":
    run()
