from datetime import datetime, timezone

from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    recipes = db.relationship(
        "Recipe",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    meal_plan_weeks = db.relationship(
        "MealPlanWeek",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "createdAt": self.created_at.isoformat(),
        }
