import axios from "axios";
import path from "path";

const parseYoutubeVideo = youtube_video_url => {
  const url = new URL(youtube_video_url);
  const video_id = url.searchParams.get("v");
  if (!video_id) {
    return `https://www.youtube.com/embed${url.pathname}`;
  }
  return `https://www.youtube.com/embed/${video_id}`;
};

const getExtension = filename => {
  return path.parse(filename).ext;
};

const getFilename = filename => {
  return path.parse(filename).name;
};

const parseGifv = imgur_url => {
  const url = new URL(imgur_url);
  // Example: https://i.imgur.com/VG899oz.mp4
  return `${url.protocol}//${url.hostname}/${getFilename(url.pathname)}.mp4`;
};

const parseJson = json => {
  const posts = [];
  json.forEach((element, index) => {
    posts.push({
      id: element.data.id,
      title: element.data.title,
      nsfw: element.data.over_18,
      is_video: element.data.is_video,
      subreddit: element.data.subreddit,
      comments_count: element.data.num_comments,
      upvotes_count: element.data.ups,
      post_url: `https://www.reddit.com${element.data.permalink}`
    });
    if (posts[index].is_video) {
      posts[index].video_url = element.data.media.reddit_video.fallback_url;
    } else {
      posts[index].pic_url = element.data.url;
    }
    if (element.data.media && element.data.media.type === "youtube.com") {
      posts[index].youtube_video_url = parseYoutubeVideo(element.data.url);
    }
    if (getExtension(element.data.url) === ".gifv") {
      posts[index].video_url = parseGifv(element.data.url);
    }
  });
  return posts;
};

const getUrl = (sub, query) => {
  if (query.after) {
    return `https://www.reddit.com/r/${sub}/top.json?after=${query.after}`;
  }
  return `https://www.reddit.com/r/${sub}/top.json`;
};

export const getSub = async (ctx, subreddit) => {
  const url = getUrl(subreddit, ctx.query);
  const response = await axios.get(url);
  const data = response.data.data.children;
  const before = response.data.data.before;
  const after = response.data.data.after;
  const posts = parseJson(data);

  ctx.body = { posts, before, after };
};
