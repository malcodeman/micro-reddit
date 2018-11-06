import Koa from "koa";
import route from "koa-route";

import { getSub } from "./subs_controller.mjs";

const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(route.get("/subs/:subreddit", getSub));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
