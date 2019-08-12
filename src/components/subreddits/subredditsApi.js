import { getSubreddit, getPopularSubreddits } from "./subredditsController";

async function routes(fastify, options) {
  fastify.route({
    method: "GET",
    url: "/popular",
    handler: async function(request, reply) {
      const subs = await getPopularSubreddits();

      reply.send({ subs });
    }
  });
  fastify.route({
    method: "GET",
    url: "/subs/:subreddit/:sort",
    handler: async function(request, reply) {
      const subreddit = request.params.subreddit;
      const sort = request.params.sort;
      const subs = await getSubreddit(subreddit, sort, request.query);

      reply.send(subs);
    }
  });
}

export default routes;
