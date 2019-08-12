import fastify from "fastify";
import cors from "fastify-cors";

import routes from "./components/subreddits/subredditsApi";

const app = fastify({ logger: true });

app.register(cors);
app.register(routes);

export default app;
