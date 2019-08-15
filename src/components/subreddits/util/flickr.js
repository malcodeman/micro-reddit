import axios from "axios";

import util from "./index";

async function getUrl(flickrUrl) {
  try {
    const FLICKR_API_KEY = process.env.FLICKR_API_KEY;
    const url = new URL(flickrUrl);
    const pathname = util.parsePathname(url.pathname);
    const photoId = pathname[2];
    const res = await axios.get(
      `https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${FLICKR_API_KEY}&photo_id=${photoId}&format=json&nojsoncallback=1`
    );
    const index = res.data.sizes.size.length - 1;
    const source = res.data.sizes.size[index].source;

    return source;
  } catch {
    throw new Error("FlickrException");
  }
}

export default {
  getUrl
};
