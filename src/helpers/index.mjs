import axios from "axios";
import path from "path";

function parseYoutubeVideo(youtube_video_url) {
  const url = new URL(youtube_video_url);
  const video_id = url.searchParams.get("v");
  if (!video_id) {
    return `https://www.youtube.com/embed${url.pathname}`;
  }
  return `https://www.youtube.com/embed/${video_id}`;
}

function getExtension(filename) {
  return path.parse(filename).ext;
}

function getFilename(filename) {
  return path.parse(filename).name;
}

function parseGifv(imgur_url) {
  const url = new URL(imgur_url);
  // Example: https://i.imgur.com/VG899oz.mp4
  return `${url.protocol}//${url.hostname}/${getFilename(url.pathname)}.mp4`;
}

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

async function parseBehance(behance_url) {
  const url = new URL(behance_url);
  const pathname = url.pathname;
  const id = pathname.split("/").reverse()[1];
  const behance_api_key = process.env.BEHANCE_API_KEY;
  try {
    const res = await axios.get(
      `https://www.behance.net/v2/projects/${id}?api_key=${behance_api_key}`
    );
    return res.data.project.modules[0].src;
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

export default {
  parseJson,
  parseBehance,
  parseGfycat,
  parseGifv,
  getFilename,
  getExtension,
  parseYoutubeVideo
};
