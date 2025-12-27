from datetime import datetime, timezone, date

from app.extensions import db


class MealPlanWeek(db.Model):
    __tablename__ = "meal_plan_weeks"
    __table_args__ = (
        db.UniqueConstraint("user_id", "week_start", name="uq_week_user_start"),
    )

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ISO week start date (typically Monday).
    week_start = db.Column(db.Date, nullable=False, index=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = db.relationship("User", back_populates="meal_plan_weeks")

    meal_groups = db.relationship(
        "MealGroup",
        back_populates="week",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="MealGroup.sort_order.asc()",
    )

    def to_dict(self, include_groups: bool = False):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "weekStart": self.week_start.isoformat(),
            "createdAt": self.created_at.isoformat(),
        }
        if include_groups:
            data["mealGroups"] = [
                g.to_dict(include_recipes=True) for g in self.meal_groups
            ]
        return data
