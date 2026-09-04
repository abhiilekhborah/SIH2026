import dotenv from "dotenv";
dotenv.config();

const config = {
  livekitUrl: process.env.LIVEKIT_URL,
  livekitApiKey: process.env.LIVEKIT_API_KEY,
  livekitApiSecret: process.env.LIVEKIT_API_SECRET,
  tokenTTL: parseInt(process.env.LIVEKIT_TOKEN_TTL_SECONDS || "7200", 10),
  port: parseInt(process.env.PORT || "5006", 10),
};

// Validate required environment variables at startup
const required = ["livekitUrl", "livekitApiKey", "livekitApiSecret"];
for (const key of required) {
  if (!config[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. Check your .env file.`
    );
  }
}

export default config;
