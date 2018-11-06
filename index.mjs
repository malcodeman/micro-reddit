import Koa from "koa";
import axios from "axios";

const app = new Koa();
const PORT = process.env.PORT || 3000;

const parseJson = json => {
  const posts = [];
  json.forEach(element => {
    posts.push({ title: element.data.title, nsfw: element.data.over_18 });
  });
  return posts;
};

app.use(async ctx => {
  const url = "https://www.reddit.com/r/popular/top.json";
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = parseJson(data);

  ctx.body = { posts, before, after };
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
