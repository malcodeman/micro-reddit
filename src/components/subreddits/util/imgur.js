import axios from "axios";

import util from "./index";

async function getAlbumUrl(imgurLink) {
  try {
    const imgurApi = "https://api.imgur.com/3";
    const url = new URL(imgurLink);
    const id = util.getFilename(url.pathname.split("/").reverse()[0]);
    const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
    const config = {
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      }
    };
    const res = await axios.get(`${imgurApi}/album/${id}/images`, config);

    return res.data.data.map(image => image.link);
  } catch (error) {
    throw new Error("ImgurException");
  }
}

function isAlbum(imgurLink) {
  const url = new URL(imgurLink);

  return url.pathname.split("/")[1] === "a";
}

export default {
  getAlbumUrl,
  isAlbum
};
