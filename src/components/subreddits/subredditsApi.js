import {
  getSubreddit,
  getPopularSubreddits,
  getPost,
} from "./subredditsController";
import { LISTING_SORT, TIME_SORT } from "./subredditsConstants";

async function routes(fastify) {
  fastify.route({
    method: "GET",
    url: "/popular",
    handler: async function (_request, reply) {
      const subs = await getPopularSubreddits();

      reply.send({ subs });
    },
  });
  fastify.route({
    method: "GET",
    url: "/subs/:subreddit/:sort",
    schema: {
      querystring: {
        after: { type: "string", default: "" },
        limit: { type: "number", default: 25, minimum: 1, maximum: 100 },
        time: {
          type: "string",
          enum: [
            TIME_SORT.hour,
            TIME_SORT.day,
            TIME_SORT.week,
            TIME_SORT.month,
            TIME_SORT.year,
            TIME_SORT.all,
          ],
        },
      },
      params: {
        type: "object",
        properties: {
          subreddit: { type: "string" },
          sort: {
            type: "string",
            enum: [
              LISTING_SORT.hot,
              LISTING_SORT.new,
              LISTING_SORT.top,
              LISTING_SORT.controversial,
              LISTING_SORT.rising,
            ],
          },
        },
        required: ["subreddit", "sort"],
      },
    },

    handler: async function (request, reply) {
      const params = {
        subreddit: request.params.subreddit,
        listingSort: request.params.sort,
      };
      const query = {
        after: request.query.after,
        limit: request.query.limit,
        timeSort: request.query.time,
      };
      const data = await getSubreddit(params, query);

      reply.send(data);
    },
  }),
    fastify.route({
      method: "GET",
      url: "/posts/:postId",
      handler: async function (request, reply) {
        const params = {
          postId: request.params.postId,
        };
        const post = await getPost(params);

        reply.send(post);
      },
    });
}

export default routes;
