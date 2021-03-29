import express from "express";
import cors from "cors";
import { getGames, getGame } from "./index.js";

const app = express();

app.get("/games/:query", cors(), async (req, res) => {
  const games = await getGames(req.params.query);
  res.json(games);
});

app.get("/game/:id", cors(), async (req, res) => {
  const game = await getGame(req.params.id);
  res.json(game);
});

const server = app.listen(3000, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://${address}:${port}`);
});
