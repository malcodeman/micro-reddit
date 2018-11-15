import Koa from "koa";
import route from "koa-route";
import cors from "@koa/cors";

import { getSub, getPopularSubs } from "./subs_controller.js";

const app = new Koa();
app.use(cors());
const PORT = process.env.PORT || 8080;

app.use(route.get("/subs/:subreddit", getSub));
app.use(route.get("/popular", getPopularSubs));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
