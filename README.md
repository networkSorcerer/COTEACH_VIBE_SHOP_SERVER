# Shoppingmall Server Starter

Node.js + Express + MongoDB starter scaffold.

## Quick start

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `env.example` to `.env` and adjust:
   ```
   cp env.example .env
   ```
   Set `MONGO_URI` to your MongoDB connection string.
3. Run in dev mode:
   ```
   npm run dev
   ```
4. Health check: open `http://localhost:4000/health`.

## Scripts
- `npm run dev` - start with nodemon
- `npm start` - start without watch

## Notes
- API base path: `/api`
- Sample route: `GET /api/` responds with `{ message: "API root" }`

