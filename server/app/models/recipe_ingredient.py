from app.extensions import db


class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredients"

    id = db.Column(db.Integer, primary_key=True)

    recipe_id = db.Column(
        db.Integer,
        db.ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(40), nullable=True)
    notes = db.Column(db.String(240), nullable=True)

    sort_order = db.Column(db.Integer, nullable=False, default=0)

    recipe = db.relationship("Recipe", back_populates="ingredients")

    def to_dict(self):
        return {
            "id": self.id,
            "recipeId": self.recipe_id,
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "notes": self.notes,
            "sortOrder": self.sort_order,
        }
