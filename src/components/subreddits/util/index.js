import path from "path";

import {
  LISTING_SORT,
  REDDIT,
  ACCEPTED_FILE_TYPES,
  SUPPORTED_DOMAINS
} from "../subredditsConstants";
import gfycat from "./gfycat";
import imgur from "./imgur";
import flickr from "./flickr";
import behance from "./behance";
import supload from "./supload";

function parsePopularSubreddits(popular) {
  return popular.map(element => {
    const parsed = {
      id: element.data.subreddit_id,
      name: element.data.subreddit,
      name_prefixed: element.data.subreddit_name_prefixed,
      subscribers_count: element.data.subreddit_subscribers
    };

    return parsed;
  });
}

function getApiUrl(params, query) {
  const { listingSort } = params;
  const { subreddit } = params;
  const { after } = query;

  if (
    listingSort === LISTING_SORT.top ||
    listingSort === LISTING_SORT.controversial
  ) {
    const { timeSort } = query;

    if (after) {
      return `${REDDIT}/r/${subreddit}/${listingSort}.json?after=${after}&t=${timeSort}`;
    }
    return `${REDDIT}/r/${subreddit}/${listingSort}.json?t=${timeSort}`;
  }
  if (after) {
    return `${REDDIT}/r/${subreddit}/${listingSort}.json?after=${after}`;
  }
  return `${REDDIT}/r/${subreddit}/${listingSort}.json`;
}

function removeSearchParams(url) {
  const parsedUrl = new URL(url);

  return `${parsedUrl.origin}${parsedUrl.pathname}`;
}

function parsePosts(posts) {
  return posts.map(element => {
    const parsed = {
      id: element.data.id,
      title: element.data.title,
      nsfw: element.data.over_18,
      subreddit: element.data.subreddit,
      comments_count: element.data.num_comments,
      upvotes_count: element.data.ups,
      post_url: `${REDDIT}${element.data.permalink}`,
      domain: element.data.domain,
      url: removeSearchParams(element.data.url),
      text_post: element.data.is_self
    };

    if (
      element.data.media &&
      element.data.media.reddit_video &&
      element.data.media.reddit_video.fallback_url
    ) {
      parsed.video_url = element.data.media.reddit_video.fallback_url;
    }
    return parsed;
  });
}

function getExtension(filename) {
  return path.parse(filename).ext;
}

function getFilename(filename) {
  return path.parse(filename).name;
}

function parsePathname(pathname) {
  const split = pathname.split("/");
  const filtered = split.filter(item => item.length);

  return filtered;
}

async function parseUrls(posts) {
  const parsed = [];
  const skipped = [];

  for (const post of posts) {
    const extension = getExtension(post.url);
    const acceptedFileType = ACCEPTED_FILE_TYPES.indexOf(extension) !== -1;

    try {
      if (acceptedFileType) {
        if (extension === ".gifv") {
          parsed.push({
            ...post,
            url: imgur.parseGifv(post.url)
          });
        } else {
          parsed.push(post);
        }
      } else {
        const domain = post.domain;

        switch (domain) {
          case SUPPORTED_DOMAINS.imgur:
            parsed.push({
              ...post,
              url: (post.url += ".jpg")
            });
            break;
          case SUPPORTED_DOMAINS.imgur && imgur.isAlbum(post.url):
            parsed.push({
              ...post,
              url: await imgur.getAlbumUrl(post.url)
            });
            break;
          case SUPPORTED_DOMAINS.flickr:
            parsed.push({
              ...post,
              url: await flickr.getUrl(post.url)
            });
            break;
          case SUPPORTED_DOMAINS.gfycat:
            parsed.push({
              ...post,
              url: await gfycat.getUrl(post.url)
            });
            break;
          case SUPPORTED_DOMAINS.behance:
            parsed.push({
              ...post,
              url: await behance.getUrl(post.url)
            });
            break;
          case SUPPORTED_DOMAINS.supload:
            parsed.push({
              ...post,
              url: await supload.getUrl(post.url)
            });
            break;
          default:
            throw new Error(`UnsupportedDomainException - ${domain}`);
        }
      }
    } catch {
      skipped.push(post);
    }
  }

  return { skipped, parsed };
}

export default {
  parsePopularSubreddits,
  getApiUrl,
  parseUrls,
  getFilename,
  parsePathname,
  parsePosts
};
