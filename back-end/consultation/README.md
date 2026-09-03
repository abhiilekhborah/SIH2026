# MediQuick — Digital Teleconsultation Backend

Standalone Express microservice for the MediQuick Digital Teleconsultation feature.
Generates secure LiveKit access tokens for voice/video consultations.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your LiveKit credentials

# 3. Start development server
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/v1/consultation/token` | Generate LiveKit room token |
| `POST` | `/api/v1/consultation/end` | End consultation (cleanup) |

### Generate Token

```bash
curl -X POST http://localhost:5006/api/v1/consultation/token \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_id": "test123",
    "role": "patient",
    "user_name": "John Doe"
  }'
```

**Response:**

```json
{
  "success": true,
  "room_name": "consultation_test123",
  "token": "<JWT>",
  "livekit_url": "wss://..."
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LIVEKIT_URL` | Yes | — | LiveKit WebSocket URL |
| `LIVEKIT_API_KEY` | Yes | — | LiveKit API Key |
| `LIVEKIT_API_SECRET` | Yes | — | LiveKit API Secret |
| `LIVEKIT_TOKEN_TTL_SECONDS` | No | `7200` | Token expiry (seconds) |
| `PORT` | No | `5006` | Server port |

## Architecture

```
consultation/
├── server.js                    # Express entry point
├── config/
│   └── consultation.config.js   # Environment config + validation
├── controllers/
│   └── teleconsult.controller.js # Request handlers
├── routes/
│   └── teleconsult.routes.js    # Route definitions
└── services/
    ├── livekit.service.js       # LiveKit token generation
    └── consultation.service.js  # Room naming + validation
```
