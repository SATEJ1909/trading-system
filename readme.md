# Trading System

A virtual trading platform where you can practice trading cryptocurrencies using real market data without risking actual money. Built this to learn full-stack development and understand how trading platforms work under the hood.

## What It Does

- **User Accounts** - Sign up, log in, keep your data secure with JWT tokens
- **Virtual Wallet** - Start with virtual money, add more whenever you want to test different strategies
- **Live Market Data** - Real crypto prices pulled from CoinGecko API
- **Order Matching** - Built an engine that matches buy/sell orders in real-time
- **Portfolio Tracking** - See your holdings, track performance, view order history
- **Real-Time Updates** - WebSockets keep everything instant (no need to refresh)
- **Clean UI** - Tried to make it look professional without being boring

## Built With

**Frontend:**
- React 19 with TypeScript (type safety is nice)
- Vite for blazing fast dev experience
- TailwindCSS 4 for styling
- Zustand for state (simpler than Redux)
- Socket.IO for real-time stuff
- Framer Motion for smooth animations

**Backend:**
- Node.js + Express
- TypeScript everywhere
- MongoDB for data storage
- Socket.IO server
- JWT for auth, Bcrypt for passwords

## Getting It Running

**You'll need:**
- Node.js 18 or higher
- MongoDB running (local or Atlas)
- npm or yarn

**Setup:**

1. Clone this thing:
```bash
git clone https://github.com/SATEJ1909/trading-system.git
cd trading-system
```

2. Backend first:
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
DATABASE_URL=mongodb://localhost:27017/trading-app
JWT_SECRET=your-secret-key-here
PORT=4000
```
(Obviously use a better secret in production)

3. Frontend:
```bash
cd frontend
npm install
```

**Running it:**

Start the backend:
```bash
cd backend
npm run dev
```

In another terminal, start the frontend:
```bash
cd frontend
npm run dev
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## Adding Some Cryptos

You need to add assets to trade before anything works. Open MongoDB and run this:

```javascript
db.assets.insertMany([
  { name: "Bitcoin", symbol: "BTC", description: "Digital Gold" },
  { name: "Ethereum", symbol: "ETH", description: "Smart Contract Platform" },
  { name: "Solana", symbol: "SOL", description: "Fast Blockchain" }
])
```

Add more if you want - just make sure the symbol matches what CoinGecko uses.

## API Reference

**Auth:**
- `POST /api/v1/user/signup` - Create new account
- `POST /api/v1/user/signin` - Login

**Wallet:**
- `GET /api/v1/wallet` - Check your balance
- `POST /api/v1/wallet/addMoney` - Add virtual funds
- `POST /api/v1/wallet/airdrop` - Get some virtual crypto to start trading
- `GET /api/v1/wallet/portfolio` - See what you own
- `GET /api/v1/wallet/orders` - Order history

**Assets:**
- `GET /api/v1/assets` - List all available cryptos

**WebSocket Events:**
- `SUBSCRIBE_MARKET` - Start listening to an asset's order book
- `PLACE_ORDER` - Submit a buy/sell order
- `ORDER_CONFIRMED` - You'll get this when your order goes through
- `ORDER_UPDATE` - Status changes on your orders
- `MARKET_UPDATE` - Live order book updates

## Deploying

**Backend:**
Works great on Render, Railway, or Heroku.
1. Add your env variables on the platform
2. Connect your GitHub repo
3. Make sure MongoDB is accessible (use Atlas if you're not running your own)
4. Don't forget to seed those assets!

**Frontend:**
Vercel or Netlify work perfectly.
1. Update the API URL in `src/api/axios.ts` to point to your deployed backend
2. Run `npm run build`
3. Deploy the `dist/` folder

## How It's Organized

```
trading-app/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Handle requests
│   │   ├── middleware/      # Auth checks, validation
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── socketserver/    # WebSocket handling
│   │   └── index.ts         # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios setup
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Contributing

Found a bug? Have an idea? Pull requests are welcome. Open an issue first if it's something major so we can discuss it.

## License

MIT - do whatever you want with it.

## Questions?

Hit me up by opening an issue on GitHub. I'll try to respond when I can.

---

Built by [@SATEJ1909](https://github.com/SATEJ1909)
