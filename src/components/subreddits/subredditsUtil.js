import axios from "axios";
import { request } from "graphql-request";

function parseYoutubeVideo(youtube_video_url) {
  const url = new URL(youtube_video_url);
  const video_id = url.searchParams.get("v");
  if (!video_id) {
    return `https://www.youtube.com/embed${url.pathname}`;
  }
  return `https://www.youtube.com/embed/${video_id}`;
}

function parseGifv(imgur_url) {
  const url = new URL(imgur_url);
  // Example: https://i.imgur.com/VG899oz.mp4
  return `${url.protocol}//${url.hostname}/${getFilename(url.pathname)}.mp4`;
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

function parsePornhub(pornhub_url) {
  const url = new URL(pornhub_url);
  const view_key = url.searchParams.get("viewkey");
  return `https://de.pornhub.com/embed/${view_key}`;
}

function parseXvideos(xvideos_url) {
  const url = new URL(xvideos_url);
  const id = url.pathname.split("/")[1].replace("video", "");
  return `https://www.xvideos.com/embedframe/${id}`;
}

async function parseSupload(supload_url) {
  const url = new URL(supload_url).pathname.replace("/", "");
  const query = `{
    image(imageId: "${url}"){
      id
      views
      upvotes
      date
      type
      compressed
      description
      tags
      uname
      title
      width
      height
      albumIds
      private
      album
      copyright
      adult
      images {
        id
        description
        width
        height
        type
        compressed
      }
    }
  }`;

  try {
    const res = await request("https://supload.com/graphql", query);
    const id = res.image.images[0].id;
    return `https://i.supload.com/${id}-hd.mp4`;
  } catch (error) {
    console.log(error);
  }
}

export default {
  parseBehance,
  parseGifv,
  parseYoutubeVideo,
  parsePornhub,
  parseXvideos,
  parseSupload
};
