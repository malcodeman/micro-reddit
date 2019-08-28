import axios from "axios";

import util from "./util";
import { REDDIT } from "./subredditsConstants";

export async function getSubreddit(params, query) {
  const url = util.getApiUrl(params, query);
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = await util.parsePosts(data);

  return { posts, before, after };
}

export async function getPopularSubreddits() {
  const res = await axios.get(`${REDDIT}/r/popular.json`);
  const data = res.data.data.children;
  const subreddits = util.parsePopularSubreddits(data);

  return subreddits;
}

export async function getPost(params) {
  const { postId } = params;
  const data = await axios.get(`${REDDIT}/comments/${postId}.json`);
  const post = data.data[0].data.children[0].data;
  const rawComments = data.data[1].data.children;
  const comments = util.parseComments(rawComments);
  const rawUrl = post.url;
  const domain = post.domain;
  const url = await util.parseUrl(rawUrl, domain);
  const serializedPost = {
    url,
    domain,
    comments,
    id: post.id,
    title: post.title,
    nsfw: post.over_18,
    subreddit: post.subreddit,
    comments_count: post.num_comments,
    upvotes_count: post.ups,
    post_url: `${REDDIT}${post.permalink}`,
    text_post: post.is_self,
    thumbnail: post.thumbnail
  };

  return serializedPost;
}

export default {
  getSubreddit,
  getPopularSubreddits
};
