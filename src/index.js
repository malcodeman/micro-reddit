import fastify from "fastify";
import cors from "fastify-cors";

import { getSub, getPopularSubs } from "./subs_controller.js";

const PORT = process.env.PORT;
const app = fastify();

app.register(cors);

app.get("/subs/:subreddit/:sort", async (request, reply) => {
  const subreddit = request.params.subreddit;
  const sort = request.params.sort;
  const subs = await getSub(subreddit, sort, request.query);

  reply.send(subs);
});

app.get("/popular", async (request, reply) => {
  const subs = await getPopularSubs();

  reply.send({ subs });
});

app.listen(PORT, (err, address) => {
  if (err) throw err;
  app.log.info(`server listening on ${address}`);
});
