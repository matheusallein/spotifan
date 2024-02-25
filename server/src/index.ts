import express, { Express, Request, Response } from "express";
import {
  generateRandomString,
  getToken,
  getArtists,
  api,
  getAlbumsByYear,
} from "./utils";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  PORT,
  REDIRECT_URI,
  SCOPE,
  STATE_KEY,
} from "./constants";
import querystring from "querystring";
// import request from "request";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import axios from "axios";

const app: Express = express();
app.use(cors()).use(cookieParser());

type Artist = {
  id: string;
};

app.get("/login", function (req: Request, res: Response) {
  const state = generateRandomString(16);
  const query = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPE,
    redirect_uri: REDIRECT_URI,
    state,
  });
  res.cookie(STATE_KEY, state);
  res.redirect(`https://accounts.spotify.com/authorize?${query}`);
});

app.get("/callback", async function (req: Request, res: Response) {
  const { code = null, state = null } = req.query;
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  if (state === null || state !== storedState) {
    const query = querystring.stringify({ error: "state_mismatch" });
    return res.redirect(`/#${query}`);
  }

  res.clearCookie(STATE_KEY);
  const { access_token, token_type } = await getToken(code);
  api.defaults.headers.common[
    "Authorization"
  ] = `${token_type} ${access_token}`;

  let artists: any[] = [];
  let currentArtists = await getArtists();
  const currentYear = String(new Date().getFullYear());
  let currentYearAlbums: any[] = [];

  while (currentArtists.artists.next) {
    artists = artists.concat(currentArtists.artists.items);
    currentArtists = await getArtists(currentArtists.artists.next);
    console.log("[ARTISTS] CURRENT LENGTH", artists.length);
  }
  console.log("[ARTISTS] FINAL LENGTH", artists.length);

  for (const artist of artists) {
    const albums = await getAlbumsByYear(artist.id, currentYear);
    currentYearAlbums = currentYearAlbums.concat(albums);
    console.log("[ALBUMS] CURRENT LENGTH", currentYearAlbums.length);
  }

  console.log("[ALBUMS] FINAL LENGTH", currentYearAlbums.length);
  console.log(currentYearAlbums);

  fs.writeFile(
    "albums.json",
    JSON.stringify(currentYearAlbums, null, 2),
    "utf-8",
    () => {
      console.log("albums.json created");
    }
  );
});

app.get("/refresh_token", async function (req: Request, res: Response) {
  const { refresh_token } = req.query;
  const token = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const url = "https://accounts.spotify.com/api/token";
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${token}`,
  };
  const form = {
    grant_type: "refresh_token",
    refresh_token,
  };

  const response = await axios.post(url, form, { headers });
  const { access_token, refresh_token: newRefreshToken } = response.data;
  res.send({ access_token, refresh_token: newRefreshToken });
});

app.get("/albums", function (req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  fs.readFile("albums.json", "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading albums.json");
    }
    const albums = JSON.parse(data);
    const paginatedAlbums = albums.slice(offset, offset + limit);
    res.send(paginatedAlbums);
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
