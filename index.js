import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const baseUrl = "https://id.twitch.tv/oauth2/token";
const igdbBaseUrl = "https://api.igdb.com/v4/";
const id = process.env.CLIENT_ID;
const secret = process.env.CLIENT_SECRET;
const body = "grant_type=client_credentials";
let accessToken;
let expiryDate;

export const getToken = () => {
  if (expiryDate > new Date() && accessToken) return accessToken;

  return fetch(`${baseUrl}?client_id=${id}&client_secret=${secret}&${body}`, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then((json) => {
      const { expires_in, access_token } = json;
      const now = new Date();
      expiryDate = new Date(now.getTime() + expires_in * 1000);
      accessToken = access_token;
      return accessToken;
    })
    .catch((e) => console.log(e));
};

const getHeaders = async () => {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Client-ID": id,
    Authorization: `Bearer ${token}`,
  };
};

export const getGameCover = async (coverIds) => {
  const headers = await getHeaders();
  const body = `fields *; where id = (${coverIds.filter(Boolean).join(",")});`;
  try {
    const res = await fetch(`${igdbBaseUrl}covers`, {
      method: "POST",
      headers,
      body,
    });
    const json = await res.json();
    const result = json.map((cover) => {
      const { id, image_id, url } = cover;
      const coverBig = `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`;
      const coverSmall = `https://images.igdb.com/igdb/image/upload/t_cover_small/${cover.image_id}.png`;
      return { id, imageId: image_id, coverThumb: url, coverBig, coverSmall };
    });
    return result;
  } catch (e) {
    console.log(e);
  }
};

export const getGames = async (query) => {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${igdbBaseUrl}games/`, {
      method: "POST",
      headers,
      body: `search \"${query}\"; fields id, name, url, cover;`,
    });
    const json = await res.json();
    const coverIds = json.map((item) => item.cover);
    const covers = await getGameCover(coverIds);
    const result = json.map((game) => {
      const { id, name, url } = game;
      const images = covers.find((cover) => cover.id === game.cover);
      return { id, name, url, images };
    });
    return result;
  } catch (e) {
    console.log(e);
  }
};

export const getGame = async (id) => {
  const headers = await getHeaders();
  const body = `fields *; where id = (${id});`;
  try {
    const res = await fetch(`${igdbBaseUrl}games/`, {
      method: "POST",
      headers,
      body,
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log(e);
  }
};
