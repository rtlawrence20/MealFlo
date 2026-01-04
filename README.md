# MealFlo

MealFlo is a full-stack meal planning and recipe management application designed to help users organize weekly meals, store recipes with cooking instructions, and view a focused “Today” cooking dashboard.

---

## Features

- User authentication with session-based auth
- Recipe management (CRUD)
  - Instructions
  - Prep & cook times
  - Notes
- CSV recipe import
- Weekly meal planner
- Daily overview dashboard
- Shopping list generation
- Dark-themed UI by default

---

## Tech Stack

### Frontend
- React (Vite)
- Mantine UI
- JavaScript (with JSDoc typing)
- Fetch wrapper with credentials support

### Backend
- Flask
- SQLAlchemy
- Flask-Migrate
- Flask-Bcrypt
- SQLite (development)

---

## Authentication

MealFlo uses **session-based authentication**

**Why sessions?**
- Simpler security model for same-origin apps
- Automatic credential handling via cookies
- Easy logout & session invalidation
- Clean protection for SPA routes

Protected endpoints rely on `login_required` guard and `/api/me` as the session source of truth.

---

## Data Model Overview

Core entities:

- User
- Recipe
- MealPlanWeek
- MealGroup
- MealGroupRecipe
- RecipeIngredient

Planner structure:

Week → Day → MealGroup → Recipes

This enables the Overview page to efficiently show today’s meals with expandable instructions.

---

## Overview Page

The Overview serves as the landing page and answers the most important question:

**“What am I cooking today?”**

It shows:
- Meal groups for today
- Recipes per group
- Expandable instructions & notes
- Prep / cook times at a glance

---

## CSV Import

Recipes can be imported via CSV.

Supported headers:

title, description, servings,  
prep_min (or prepMin),  
cook_min (or cookMin),  
instructions, notes,  
ingredient_name (or ingredient),  
quantity, unit

Rows with the same title are grouped into a single recipe.

---

## Getting Started

### Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export FLASK_APP=run.py
flask db upgrade
python seed.py
flask run
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Visit: http://127.0.0.1:5173

Demo credentials:

username: demo  
password: password

---

## Future Improvements

- Public recipe sharing
- Tag-based search
- Nutrition data
- Multi-user household planning

