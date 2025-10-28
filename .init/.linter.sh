#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-expense-tracker-181971-181982/expense_tracker_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

