from flask import Blueprint, jsonify, session

from app.routes._auth_guard import login_required
from app.services.overview_service import get_today_overview

overview_bp = Blueprint("overview", __name__)


@overview_bp.get("/overview/today")
@login_required
def overview_today():
    user_id = session["user_id"]
    payload = get_today_overview(user_id=user_id)
    return jsonify(payload)
