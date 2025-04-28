#!/bin/bash
set -e

PORT=${PORT:-8000}

# Wait for database
if [ -n "$USER_DB_HOST" ] && [ -n "$USER_DB_PORT" ]; then
  echo "Waiting for database at $USER_DB_HOST:$USER_DB_PORT..."
  while ! nc -z "$USER_DB_HOST" "$USER_DB_PORT"; do
    sleep 0.1
  done
  echo "Database is up!"
fi

# Run collectstatic
echo "Collecting static files..."
python manage.py collectstatic --noinput || {
  echo "collectstatic failed, continuing to Gunicorn..."
}

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Start Gunicorn
echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 3 --timeout 600 edgr_invest.wsgi:application