from app.extensions import db


class MealGroupRecipe(db.Model):
    __tablename__ = "meal_group_recipes"

    id = db.Column(db.Integer, primary_key=True)

    meal_group_id = db.Column(
        db.Integer,
        db.ForeignKey("meal_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    recipe_id = db.Column(
        db.Integer,
        db.ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Planned servings for this placement (may differ from recipe default)
    planned_servings = db.Column(db.Integer, nullable=False, default=1)

    sort_order = db.Column(db.Integer, nullable=False, default=0)

    meal_group = db.relationship("MealGroup", back_populates="group_recipes")
    recipe = db.relationship("Recipe", back_populates="group_recipes")

    def to_dict(self, include_recipe: bool = False):
        data = {
            "id": self.id,
            "mealGroupId": self.meal_group_id,
            "recipeId": self.recipe_id,
            "plannedServings": self.planned_servings,
            "sortOrder": self.sort_order,
        }
        if include_recipe and self.recipe:
            data["recipe"] = self.recipe.to_dict(include_ingredients=False)
        return data
