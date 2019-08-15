import axios from "axios";

export async function getUrl(gfycatUrl) {
  try {
    const GFYCAT_API_KEY = process.env.GFYCAT_API_KEY;
    const gfycatApi = "https://api.gfycat.com/v1";
    const url = new URL(gfycatUrl);
    const pathname = url.pathname;
    const id = pathname.split("/")[1];
    const config = {
      headers: {
        Authorization: `Bearer ${GFYCAT_API_KEY}`
      }
    };
    const res = await axios.get(`${gfycatApi}/gfycats/${id}`, config);

    return res.data.gfyItem.mp4Url;
  } catch (err) {
    throw new Error("GfycatException");
  }
}

export default {
  getUrl
};
