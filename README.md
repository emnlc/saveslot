# SaveSlot

A game tracking and social review platform that lets users manage their backlog and discover new titles. Built as a Letterboxd/AniList style experience for video games. 

[saveslot.app](https://saveslot.app/)

**Test Account:**
- `demo@email.com`
- `Password123-`

## 🛠️ Technologies

- `React`
- `TypeScript`
- `Bun`
- `Hono`
- `Supabase`
- `Docker`

## ✨ Features

- Organize games by status: backlog, wishlist, playing, completed, and more
- Rate games on a 1-5 star scale and write reviews
- Create and share custom game lists
- Profile customization features your favorite games, currently playing, popular lists, and more

## 💡 Why I Built This
As someone with a growing backlog of unplayed games and no good way to track them, I wanted to build my own solution. I'm a regular user of Letterboxd for films and AniList for anime, so creating a similar experience for games felt like a natural project. This also gave me an opportunity to learn new architecture using Bun and Hono.

## ⚙️ Setup & Configuration

### Prerequisites
- Bun (recommended) or Node.js 18.x or higher
- Supabase account
- IGDB API credentials (Twitch Developer account)
- Docker and Docker Compose (optional)

### Environment Variables
**Client** - Create `client/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON=your_anon_key
```

**Server** - Create `server/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE=your_service_key
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
LOCAL_NETWORK_URL=http://localhost:5173
```

#### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL commands in [saveslot.sql](https://github.com/user-attachments/files/23594921/saveslot.sql) via the Supabase SQL Editor
3. Copy your project URL and keys to the `.env` files

#### IGDB API Setup
1. Create a Twitch Developer account at [dev.twitch.tv](https://dev.twitch.tv)
2. Register a new application
3. Copy Client ID and generate a Client Secret
4. Add credentials to `server/.env`

## 🚀 Running the Project

**With Docker (recommended):**
```bash
docker compose up
```

**Without Docker:**
```bash
# Terminal 1 - Client
cd client
bun install
bun run dev
```
```bash
# Terminal 2 - Server
cd server
bun install
bun run dev
```

## 📸 Preview

<video width="630" height="300" src="https://github.com/user-attachments/assets/57df16a9-994e-4fcf-8e8a-3fd1e54cf4e4"></video>
