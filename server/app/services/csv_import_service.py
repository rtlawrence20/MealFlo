import csv
import io
from collections import defaultdict

from app.extensions import db
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient


def import_recipes_from_csv_text(user_id: int, csv_text: str) -> dict:
    """
    Import recipes from CSV text.

    Supported columns (case-insensitive):
      - title (required)
      - description (optional)
      - servings (optional)
      - ingredient_name OR ingredient (optional; if missing, row can still create recipe)
      - quantity (optional)
      - unit (optional)
      - notes (optional)

    Behavior:
      - Groups rows by title
      - Creates one Recipe per title
      - Adds ingredients in row order
      - Skips blank ingredient rows
    """
    if not csv_text or not csv_text.strip():
        raise ValueError("csvText is required")

    f = io.StringIO(csv_text)
    reader = csv.DictReader(f)
    if not reader.fieldnames:
        raise ValueError("CSV must include a header row")

    # Normalize headers -> lower
    field_map = {h: (h or "").strip().lower() for h in reader.fieldnames}

    def get(row: dict, key: str):
        for original, lower in field_map.items():
            if lower == key:
                return row.get(original)
        return None

    grouped = defaultdict(list)

    for row in reader:
        title = (get(row, "title") or "").strip()
        if not title:
            continue
        grouped[title].append(row)

    created = 0
    recipes = []

    for title, rows in grouped.items():
        # Pull recipe-level fields from first row
        first = rows[0]
        description = (get(first, "description") or "").strip() or None
        servings_raw = (get(first, "servings") or "").strip()

        try:
            servings = int(servings_raw) if servings_raw else 1
        except ValueError:
            servings = 1

        recipe = Recipe(
            user_id=user_id,
            title=title,
            description=description,
            servings=servings if servings > 0 else 1,
        )

        # Ingredient rows
        sort = 0
        for row in rows:
            name = (get(row, "ingredient_name") or get(row, "ingredient") or "").strip()
            if not name:
                continue

            qty_raw = (get(row, "quantity") or "").strip()
            unit = (get(row, "unit") or "").strip() or None
            notes = (get(row, "notes") or "").strip() or None

            qty = None
            if qty_raw:
                try:
                    qty = float(qty_raw)
                except ValueError:
                    qty = None

            recipe.ingredients.append(
                RecipeIngredient(
                    name=name,
                    quantity=qty,
                    unit=unit,
                    notes=notes,
                    sort_order=sort,
                )
            )
            sort += 1

        db.session.add(recipe)
        db.session.flush()  # get id for response
        created += 1
        recipes.append(recipe)

    db.session.commit()

    return {
        "createdCount": created,
        "recipes": [r.to_dict(include_ingredients=True) for r in recipes],
    }
