import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 8000;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;
export const STATE_KEY = 'spotify_auth_state';
export const SCOPE = 'user-follow-read';