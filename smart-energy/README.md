# Smart Energy Usage Tracker

Simple full‑stack app (Node.js + Express + MongoDB + React) implementing secure coding practices with explicit REQ tags in code.

## Quickstart

1. Install MongoDB and start it locally.
2. From repo root:

```
npm run install:all
cp .env.example .env
npm run dev
```

- API: http://localhost:7000/api
- Docs: http://localhost:7000/api/docs
- App: http://localhost:5173

Seed users:
- admin@example.com / Admin#1234
- user@example.com / User#1234

## Notes

- Backend uses Express, Mongoose, JWT, bcrypt, winston, helmet, CORS, rate‑limit, HPP, express‑mongo‑sanitize, sanitize‑html.
- Frontend uses React (Vite), axios, react‑hook‑form, yup, dompurify, react‑chartjs‑2 + chart.js.
- Validation, sanitization, NoSQLi prevention, XSS encoding, auth and permissions all have `// [REQ:...]` inline comments at implementation points.
