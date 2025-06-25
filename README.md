# Art Therapy Mood Tracker

A web application that analyzes your drawings to predict your emotional state.

## What it does

Draw something on the canvas and the app will analyze your artwork to determine if you're feeling Happy, Sad, Calm, or Angry. It uses computer vision to look at colors, shapes, and patterns in your drawing.

## How to use

1. Start the application with Docker
2. Open your web browser to http://localhost:3000
3. Sign in with your Google account
4. Draw something on the canvas using the drawing tools
5. Click "Analyze Mood" to see what emotion your artwork expresses
6. View your mood history in the History section

## Requirements

- Docker and Docker Compose installed
- Google account for login
- Web browser (Chrome, Firefox, Safari, etc.)

## Setup

1. Clone this repository
2. Run: docker-compose up
3. Wait for both services to start
4. Open http://localhost:3000 in your browser

## Services

- Frontend: React drawing interface at http://localhost:3000
- Backend: Python API at http://localhost:8000

## Results

You get:
- Primary emotion detected (Happy, Sad, Calm, Angry)
- Confidence level (how sure the AI is)

## Troubleshooting

- If Firebase auth fails: check .env file exists and has correct credentials
- If backend not responding: make sure Docker containers are running
- If upload fails: check file format and internet connection
- If analysis takes long: larger files take more time to process

