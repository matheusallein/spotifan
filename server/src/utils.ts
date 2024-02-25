import crypto from "crypto";
import { ParsedQs } from "qs";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "./constants";
import axios from "axios";

export const generateRandomString = (length: number) =>
  crypto.randomBytes(60).toString("hex").slice(0, length);

export const getToken = async (
  code: string | ParsedQs | string[] | ParsedQs[] | null
) => {
  const token = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const url = "https://accounts.spotify.com/api/token";
  const form = {
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  };
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${token}`,
  };

  const response = await axios.post(url, form, { headers });
  return response.data;
};

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export const getArtists = async (after?: string) => {
  const url =
    after || "https://api.spotify.com/v1/me/following?type=artist&limit=50";
  const response = await api(url);
  return response.data;
};

export const getAlbumsByYear = async (artistId: string, year: string) => {
  const response = await api(
    `https://api.spotify.com/v1/artists/${artistId}/albums`
  );
  const albums = response.data.items.filter((album: any) => {
    return (
      album.release_date.split("-")[0] === year && album.album_group === "album"
    );
  });
  return albums;
};

export default {
  generateRandomString,
  getArtists,
  getAlbumsByYear,
};
