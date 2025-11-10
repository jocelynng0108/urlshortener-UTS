# URL Shortener + QR

Simple URL shortener with QR generation.

## Run locally with Docker Compose
1. Build & run:
```bash
docker-compose up --build
```

2. Open frontend: http://localhost:8080
3. API endpoints:
- POST /api/shorten { url, custom (optional), ttl (seconds optional) }
- GET /:code -> redirect
- GET /api/info/:code
- POST /api/generate-qr { code, size }

## CI/CD (GitHub Actions)
- Adds workflow to build images and push to Docker Hub.
- Set secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN

## Notes
- Storage currently in-memory: restart clears data. For production add DB (Redis/MySQL).
- Set BASE_URL env on server to public domain so short links are correct.
