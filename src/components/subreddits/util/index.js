import { SORTS, REDDIT } from "../subredditsConstants";
import helpers from "../subredditsUtil";

function parsePopularSubreddits(popular) {
  return popular.map(element => {
    const parsed = {
      id: element.data.subreddit_id,
      name: element.data.subreddit,
      name_prefixed: element.data.subreddit_name_prefixed,
      subscribers_count: element.data.subreddit_subscribers
    };

    return parsed;
  });
}

function getApiUrl(sub, sort, query) {
  if (sort === SORTS.top || sort === SORTS.controversial) {
    const time = query.t;

    if (query.after) {
      return `${REDDIT}/r/${sub}/${sort}.json?after=${query.after}&t=${time}`;
    }
    return `${REDDIT}/r/${sub}/${sort}.json?t=${time}`;
  }
  if (query.after) {
    return `${REDDIT}/r/${sub}/${sort}.json?after=${query.after}`;
  }
  return `${REDDIT}/r/${sub}/${sort}.json`;
}

function parsePosts(posts) {
  return posts.map(element => {
    const parsed = {
      id: element.data.id,
      title: element.data.title,
      nsfw: element.data.over_18,
      subreddit: element.data.subreddit,
      comments_count: element.data.num_comments,
      upvotes_count: element.data.ups,
      post_url: `${REDDIT}${element.data.permalink}`,
      domain: element.data.domain,
      url: element.data.url,
      text_post: element.data.is_self
    };

    if (
      element.data.media &&
      element.data.media.reddit_video &&
      element.data.media.reddit_video.fallback_url
    ) {
      parsed.video_url = element.data.media.reddit_video.fallback_url;
    }
    return parsed;
  });
}

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

export default {
  parsePopularSubreddits,
  getApiUrl,
  processImages,
  processVideos,
  parsePosts
};
