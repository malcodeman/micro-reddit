import axios from "axios";

import helpers from "./helpers";

async function processVideos(posts) {
  for (let post of posts) {
    if (post.domain === "gfycat.com") {
      post.video_url = await helpers.parseGfycat(post.url);
    }
    if (helpers.getExtension(post.url) === ".gifv") {
      post.video_url = helpers.parseGifv(post.url);
    }
    if (
      post.domain === "youtube.com" ||
      post.domain === "youtu.be" ||
      post.domain === "m.youtube.com"
    ) {
      post.youtube_video_url = helpers.parseYoutubeVideo(post.url);
    }
  }
  return posts;
}

async function processImages(posts) {
  for (let post of posts) {
    if (
      post.domain === "imgur.com" &&
      helpers.getExtension(post.url) !== ".jpg"
    ) {
      post.url = post.url += ".jpg";
    }
    if (post.domain === "behance.net") {
      post.url = await helpers.parseBehance(post.url);
    }
  }
  return posts;
}

const getUrl = (sub, query) => {
  if (query.after) {
    return `https://www.reddit.com/r/${sub}/top.json?after=${query.after}`;
  }
  return `https://www.reddit.com/r/${sub}/top.json`;
};

export const getSub = async (ctx, subreddit) => {
  const url = getUrl(subreddit, ctx.query);
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = await processVideos(
    await processImages(helpers.parseJson(data))
  );

  ctx.body = { posts, before, after };
};
