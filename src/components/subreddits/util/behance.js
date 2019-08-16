import axios from "axios";

async function getUrl(behanceUrl) {
  try {
    const url = new URL(behanceUrl);
    const pathname = url.pathname;
    const behanceApiUrl = "https://www.behance.net/v2";
    const id = pathname.split("/").reverse()[1];
    const BEHANCE_API_KEY = process.env.BEHANCE_API_KEY;
    const res = await axios.get(
      `${behanceApiUrl}/projects/${id}?api_key=${BEHANCE_API_KEY}`
    );

    return res.data.project.modules[0].src;
  } catch {
    throw new Error("BehanceException");
  }
}

export default {
  getUrl
};
