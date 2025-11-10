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

---

## 👥 Kelompok Bug4Fun
| No | Nama Lengkap | NIM | Peran |
|----|---------------|-----|-------|
| 1 | **Samuel G. Christian Pakpahan** | 221113531 | Ketua / Fullstack Developer |
| 2 | **Jocelyn** | 221110108 | Frontend Developer |
| 3 | **Maesi** | 221112816 | Backend Developer |
| 4 | **Sontiar Eseria Tampubolon** | 221112223 | DevOps & Dokumentasi |

---
