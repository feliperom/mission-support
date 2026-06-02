# Mission Support

Aplicação de Gestão de Sustento Missionário — Plataforma multi-tenant para missionários gerenciarem mantenedores, ofertas e relacionamentos.

## Stack

- **Frontend:** Angular 21 + Tailwind CSS v4
- **Backend:** Express + TypeScript + Drizzle ORM
- **Database:** Neon PostgreSQL (Serverless)
- **Deploy:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Neon PostgreSQL account (free tier)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. Create `server/.env`:
   ```
   DATABASE_URL=postgresql://user:pass@your-neon-host/dbname?sslmode=require
   JWT_SECRET=your-jwt-secret-here
   JWT_REFRESH_SECRET=your-refresh-secret-here
   PORT=3000
   ```

4. Run database migrations:
   ```bash
   cd server && npx drizzle-kit push
   ```

5. Start development:
   ```bash
   # From root
   npm run dev
   ```

   Or separately:
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm start
   ```

### Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel Dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
3. Deploy!

## License

MIT
