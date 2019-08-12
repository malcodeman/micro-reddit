import fastify from "fastify";
import cors from "fastify-cors";

import routes from "./components/subreddits/subredditsApi";

const app = fastify();

app.register(cors);
app.register(routes);

export default app;
