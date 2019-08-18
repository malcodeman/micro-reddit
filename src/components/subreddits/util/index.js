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
  const { after, limit } = query;

  if (
    listingSort === LISTING_SORT.top ||
    listingSort === LISTING_SORT.controversial
  ) {
    const { timeSort } = query;

    if (after) {
      return `${REDDIT}/r/${subreddit}/${listingSort}.json?after=${after}&t=${timeSort}&limit=${limit}`;
    }
    return `${REDDIT}/r/${subreddit}/${listingSort}.json?t=${timeSort}&limit=${limit}`;
  }
  if (after) {
    return `${REDDIT}/r/${subreddit}/${listingSort}.json?after=${after}&limit=${limit}`;
  }
  return `${REDDIT}/r/${subreddit}/${listingSort}.json?limit=${limit}`;
}

function removeSearchParams(url) {
  const parsedUrl = new URL(url);

  return `${parsedUrl.origin}${parsedUrl.pathname}`;
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

async function parsePosts(posts) {
  const parsed = [];
  const skipped = [];

  for (const post of posts) {
    const parsedPost = {
      id: post.data.id,
      title: post.data.title,
      nsfw: post.data.over_18,
      subreddit: post.data.subreddit,
      comments_count: post.data.num_comments,
      upvotes_count: post.data.ups,
      post_url: `${REDDIT}${post.data.permalink}`,
      domain: post.data.domain,
      url: removeSearchParams(post.data.url),
      text_post: post.data.is_self
    };
    const url = parsedPost.url;
    const extension = getExtension(url);
    const acceptedFileType = ACCEPTED_FILE_TYPES.indexOf(extension) !== -1;

    try {
      if (acceptedFileType) {
        if (extension === ".gifv") {
          parsed.push({
            ...parsedPost,
            url: imgur.parseGifv(url)
          });
        } else {
          parsed.push(parsedPost);
        }
      } else {
        const domain = parsedPost.domain;

        switch (domain) {
          case SUPPORTED_DOMAINS.imgur:
            parsed.push({
              ...parsedPost,
              url: `${url}.jpg`
            });
            break;
          case SUPPORTED_DOMAINS.imgur && imgur.isAlbum(url):
            parsed.push({
              ...parsedPost,
              url: await imgur.getAlbumUrl(url)
            });
            break;
          case SUPPORTED_DOMAINS.flickr:
            parsed.push({
              ...parsedPost,
              url: await flickr.getUrl(url)
            });
            break;
          case SUPPORTED_DOMAINS.gfycat:
            parsed.push({
              ...parsedPost,
              url: await gfycat.getUrl(url)
            });
            break;
          case SUPPORTED_DOMAINS.behance:
            parsed.push({
              ...parsedPost,
              url: await behance.getUrl(url)
            });
            break;
          case SUPPORTED_DOMAINS.supload:
            parsed.push({
              ...parsedPost,
              url: await supload.getUrl(url)
            });
            break;
          default:
            throw new Error(`UnsupportedDomainException - ${domain}`);
        }
      }
    } catch {
      skipped.push(parsedPost);
    }
  }

  return { skipped, parsed };
}

export default {
  parsePopularSubreddits,
  getApiUrl,
  parsePosts,
  getFilename,
  parsePathname
};
