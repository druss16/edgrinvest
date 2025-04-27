#!/bin/bash
set -e

PORT=${PORT:-8000}

# Run collectstatic
echo "Collecting static files..."
python manage.py collectstatic --noinput || {
  echo "collectstatic failed, continuing to Gunicorn...";
}

# Start Gunicorn
echo "Starting Gunicorn..."
exec gunicorn edgr_project.wsgi:application --bind 0.0.0.0:$PORT --timeout 600 --workers 1 --worker-class gevent
