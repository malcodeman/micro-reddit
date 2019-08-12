import axios from "axios";

import helpers from "./subredditsUtil";

async function processVideos(posts) {
  for (let post of posts) {
    if (helpers.getExtension(post.url) === ".mp4") {
      post.video_url = post.url;
    }
    if (post.domain === "gfycat.com" || post.domain === "zippy.gfycat.com") {
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
      post.iframe_video = helpers.parseYoutubeVideo(post.url);
    }
    if (
      post.domain === "pornhub.com" ||
      post.domain === "de.pornhub.com" ||
      post.domain === "es.pornhub.com"
    ) {
      post.iframe_video = helpers.parsePornhub(post.url);
    }
    if (post.domain === "xvideos.com") {
      post.iframe_video = helpers.parseXvideos(post.url);
    }
    if (post.domain === "supload.com") {
      post.video_url = await helpers.parseSupload(post.url);
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
    if (
      (post.domain === "imgur.com" || post.domain === "m.imgur.com") &&
      helpers.isImgurAlbum(post.url)
    ) {
      post.imgur_album = await helpers.parseImgurAlbum(post.url);
    }
    if (post.domain === "behance.net") {
      post.url = await helpers.parseBehance(post.url);
    }
    if (post.domain === "flickr.com") {
      post.url = await helpers.parseFlickr(post.url);
    }
  }
  return posts;
}

const getUrl = (sub, sort, query) => {
  // Sorts that can have time query
  const sorts = ["controversial", "top"];

  if (sort === sorts[0] || sort === sorts[1]) {
    const time = query.t;
    if (query.after) {
      return `https://www.reddit.com/r/${sub}/${sort}.json?after=${
        query.after
      }&t=${time}`;
    }
    return `https://www.reddit.com/r/${sub}/${sort}.json?t=${time}`;
  }
  if (query.after) {
    return `https://www.reddit.com/r/${sub}/${sort}.json?after=${query.after}`;
  }
  return `https://www.reddit.com/r/${sub}/${sort}.json`;
};

export const getSubreddit = async (subreddit, sort, query) => {
  const url = getUrl(subreddit, sort, query);
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = await processVideos(
    await processImages(helpers.parseJson(data))
  );

  return { posts, before, after };
};

function parsePopularSubs(json) {
  return json.map(element => {
    const parsedElement = {
      id: element.data.subreddit_id,
      name: element.data.subreddit,
      name_prefixed: element.data.subreddit_name_prefixed,
      subscribers_count: element.data.subreddit_subscribers
    };
    return parsedElement;
  });
}

export async function getPopularSubreddits() {
  const res = await axios.get("https://www.reddit.com/r/popular.json");
  const data = res.data.data.children;
  const subs = parsePopularSubs(data);

  return subs;
}
