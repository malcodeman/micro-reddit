import Koa from "koa";
import route from "koa-route";
import cors from "@koa/cors";

import { getSub } from "./subs_controller.mjs";

const app = new Koa();
app.use(cors());
const PORT = process.env.PORT || 8080;

app.use(route.get("/subs/:subreddit", getSub));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
