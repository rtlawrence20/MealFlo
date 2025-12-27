from datetime import date

from app.extensions import db


class MealGroup(db.Model):
    __tablename__ = "meal_groups"

    id = db.Column(db.Integer, primary_key=True)

    week_id = db.Column(
        db.Integer,
        db.ForeignKey("meal_plan_weeks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Day inside the week (YYYY-MM-DD)
    day = db.Column(db.Date, nullable=False, index=True)

    # e.g. "Breakfast", "Dinner", "Meal 1", etc.
    name = db.Column(db.String(80), nullable=False)

    sort_order = db.Column(db.Integer, nullable=False, default=0)

    week = db.relationship("MealPlanWeek", back_populates="meal_groups")

    group_recipes = db.relationship(
        "MealGroupRecipe",
        back_populates="meal_group",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="MealGroupRecipe.sort_order.asc()",
    )

    def to_dict(self, include_recipes: bool = False):
        data = {
            "id": self.id,
            "weekId": self.week_id,
            "day": self.day.isoformat(),
            "name": self.name,
            "sortOrder": self.sort_order,
        }
        if include_recipes:
            data["recipes"] = [
                gr.to_dict(include_recipe=True) for gr in self.group_recipes
            ]
        return data
