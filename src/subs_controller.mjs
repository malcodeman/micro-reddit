import axios from "axios";
import path from "path";

const parseYoutubeVideo = youtube_video_url => {
  const url = new URL(youtube_video_url);
  const video_id = url.searchParams.get("v");
  if (!video_id) {
    return `https://www.youtube.com/embed${url.pathname}`;
  }
  return `https://www.youtube.com/embed/${video_id}`;
};

const getExtension = filename => {
  return path.parse(filename).ext;
};

const getFilename = filename => {
  return path.parse(filename).name;
};

const parseGifv = imgur_url => {
  const url = new URL(imgur_url);
  // Example: https://i.imgur.com/VG899oz.mp4
  return `${url.protocol}//${url.hostname}/${getFilename(url.pathname)}.mp4`;
};

async function parseGfycat(gfycat_url) {
  const url = new URL(gfycat_url);
  const pathname = url.pathname;
  const id = pathname.split("/").pop();
  try {
    const res = await axios.get(`https://gfycat.com/cajax/get/${id}`);
    return `${res.data.gfyItem.mp4Url}`;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function parseJson(json) {
  return json.map(element => {
    const parsedElement = {
      id: element.data.id,
      title: element.data.title,
      nsfw: element.data.over_18,
      subreddit: element.data.subreddit,
      comments_count: element.data.num_comments,
      upvotes_count: element.data.ups,
      post_url: `https://www.reddit.com${element.data.permalink}`,
      domain: element.data.domain,
      url: element.data.url
    };
    if (
      element.data.media &&
      element.data.media.reddit_video &&
      element.data.media.reddit_video.fallback_url
    ) {
      parsedElement.video_url = element.data.media.reddit_video.fallback_url;
    }
    return parsedElement;
  });
}

async function processVideos(posts) {
  for (let post of posts) {
    if (post.domain === "gfycat.com") {
      post.video_url = await parseGfycat(post.url);
    }
    if (getExtension(post.url) === ".gifv") {
      post.video_url = parseGifv(post.url);
    }
    if (
      post.domain === "youtube.com" ||
      post.domain === "youtu.be" ||
      post.domain === "m.youtube.com"
    ) {
      post.youtube_video_url = parseYoutubeVideo(post.url);
    }
  }
  return posts;
}

function processImages(posts) {
  for (let post of posts) {
    if (post.domain === "imgur.com" && getExtension(post.url) !== ".jpg") {
      post.url = post.url += ".jpg";
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
  const posts = await processVideos(processImages(parseJson(data)));

  ctx.body = { posts, before, after };
};
