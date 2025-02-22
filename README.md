# 🚽 Global Fart Tracker 💨

## About
A hilarious web app that lets users track and share fart locations around the world using Next.js, Supabase, and React Leaflet.

## Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase Account

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/fart-tracker.git
cd fart-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
- Create a new Supabase project
- Create a table called `fart_locations` with these columns:
  - `id`: int8 (primary key)
  - `latitude`: float8
  - `longitude`: float8
  - `description`: text (optional)
  - `timestamp`: timestamptz
  - `user_id`: text (optional)

4. Configure Environment
- Copy `.env.example` to `.env.local`
- Fill in your Supabase URL and Anon Key

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking farts! 💩

## Features
- Interactive world map
- Click to log fart locations
- View global fart history
- Responsive design

## Technologies
- Next.js 14
- Supabase
- React Leaflet
- Tailwind CSS

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
