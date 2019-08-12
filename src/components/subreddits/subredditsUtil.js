import axios from "axios";
import path from "path";
import { request } from "graphql-request";

import { REDDIT } from "./subredditsConstants";

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
  const id = pathname.split("/")[1];
  try {
    const gfycat_api_key = process.env.GFYCAT_API_KEY;
    const config = {
      headers: {
        Authorization: `Bearer ${gfycat_api_key}`
      }
    };
    const res = await axios.get(
      `https://api.gfycat.com/v1/gfycats/${id}`,
      config
    );
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

async function parseImgurAlbum(imgur_link) {
  const url = new URL(imgur_link);
  const id = getFilename(url.pathname.split("/").reverse()[0]);
  const imgur_client_id = process.env.IMGUR_CLIENT_ID;
  const config = {
    headers: {
      Authorization: `Client-ID ${imgur_client_id}`
    }
  };
  try {
    const res = await axios.get(
      `https://api.imgur.com/3/album/${id}/images`,
      config
    );
    return res.data.data.map(image => image.link);
  } catch (error) {
    console.log(error);
    return error;
  }
}

function isImgurAlbum(imgur_link) {
  const url = new URL(imgur_link);
  return url.pathname.split("/")[1] === "a";
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

function parsePathname(pathname) {
  const split = pathname.split("/");
  const filtered = split.filter(item => item.length);

  return filtered;
}

async function parseFlickr(flickrUrl) {
  const FLICKR_API_KEY = process.env.FLICKR_API_KEY;
  const url = new URL(flickrUrl);
  const pathname = parsePathname(url.pathname);
  const photoId = pathname[2];

  try {
    const res = await axios.get(
      `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${FLICKR_API_KEY}&photo_id=${photoId}&format=json&nojsoncallback=1`
    );
    const index = res.data.sizes.size.length - 1;
    const source = res.data.sizes.size[index].source;

    return source;
  } catch (error) {
    throw new Error(error);
  }
}

export default {
  parseBehance,
  parseGfycat,
  parseGifv,
  getFilename,
  getExtension,
  parseYoutubeVideo,
  isImgurAlbum,
  parseImgurAlbum,
  parsePornhub,
  parseXvideos,
  parseSupload,
  parseFlickr
};
