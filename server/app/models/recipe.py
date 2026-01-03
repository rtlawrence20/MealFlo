from datetime import datetime, timezone
from app.extensions import db


class Recipe(db.Model):
    __tablename__ = "recipes"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    servings = db.Column(db.Integer, nullable=False, default=1)
    prep_min = db.Column(db.Integer, nullable=True)
    cook_min = db.Column(db.Integer, nullable=True)
    instructions = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = db.relationship("User", back_populates="recipes")

    ingredients = db.relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="RecipeIngredient.sort_order.asc()",
    )

    group_recipes = db.relationship(
        "MealGroupRecipe",
        back_populates="recipe",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def to_dict(self, include_ingredients: bool = False):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "title": self.title,
            "description": self.description,
            "servings": self.servings,
            "prepMin": self.prep_min,
            "cookMin": self.cook_min,
            "instructions": self.instructions,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }
        if include_ingredients:
            data["ingredients"] = [i.to_dict() for i in self.ingredients]
        return data
