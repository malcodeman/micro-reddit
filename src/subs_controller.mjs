import axios from "axios";

const parseJson = json => {
  const posts = [];
  json.forEach(element => {
    posts.push({ title: element.data.title, nsfw: element.data.over_18 });
  });
  return posts;
};

export const getSub = async (ctx, subreddit) => {
  const url = `https://www.reddit.com/r/${subreddit}/top.json`;
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = parseJson(data);

  ctx.body = { posts, before, after };
};
