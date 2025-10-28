# Expense Tracker Frontend (React)

Purpose
- UI for tracking expenses, categories, budgets, and viewing reports.

Configure API base
- Copy .env.example to .env
- Set REACT_APP_API_BASE to your backend /api (default: http://localhost:3001/api)

Run
- cd expense_tracker_frontend
- npm install
- npm start
- App runs at http://localhost:3000

Auth
- Use backend-created user (via Django admin or createsuperuser).
- Login to obtain JWT; tokens stored in localStorage.
