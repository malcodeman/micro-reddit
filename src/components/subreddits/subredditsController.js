import axios from "axios";

import util from "./util";
import { REDDIT } from "./subredditsConstants";

export async function getSubreddit(params, query) {
  const url = util.getApiUrl(params, query);
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = await util.processVideos(
    await util.processImages(util.parsePosts(data))
  );

  return { posts, before, after };
}

export async function getPopularSubreddits() {
  const res = await axios.get(`${REDDIT}/r/popular.json`);
  const data = res.data.data.children;
  const subreddits = util.parsePopularSubreddits(data);

  return subreddits;
}

export default {
  getSubreddit,
  getPopularSubreddits
};
