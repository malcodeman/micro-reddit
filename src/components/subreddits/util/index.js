import path from "path";

import {
  LISTING_SORT,
  REDDIT,
  ACCEPTED_FILE_TYPES,
  SUPPORTED_DOMAINS,
  UNACCEPTED_COMMENTS
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

async function parseUrl(rawUrl, domain) {
  const url = removeSearchParams(rawUrl);
  const extension = getExtension(url);
  const acceptedFileType = ACCEPTED_FILE_TYPES.indexOf(extension) !== -1;

  if (acceptedFileType) {
    if (extension === ".gifv") {
      return imgur.parseGifv(url);
    } else {
      return url;
    }
  } else {
    switch (domain) {
      case SUPPORTED_DOMAINS.imgur:
        return `${url}.jpg`;
      case SUPPORTED_DOMAINS.imgur && imgur.isAlbum(url):
        return await imgur.getAlbumUrl(url);
      case SUPPORTED_DOMAINS.flickr:
        return await flickr.getUrl(url);
      case SUPPORTED_DOMAINS.gfycat:
        return await gfycat.getUrl(url);
      case SUPPORTED_DOMAINS.behance:
        return await behance.getUrl(url);
      case SUPPORTED_DOMAINS.supload:
        return await supload.getUrl(url);
      default:
        throw new Error(`UnsupportedDomainException - ${domain}`);
    }
  }
}

async function parsePosts(posts) {
  const parsed = [];
  const skipped = [];

  for (const post of posts) {
    const serializedPost = {
      url: post.data.url,
      domain: post.data.domain,
      id: post.data.id,
      title: post.data.title,
      nsfw: post.data.over_18,
      subreddit: post.data.subreddit,
      comments_count: post.data.num_comments,
      upvotes_count: post.data.ups,
      post_url: `${REDDIT}${post.data.permalink}`,
      text_post: post.data.is_self,
      thumbnail: post.data.thumbnail
    };

    try {
      const rawUrl = serializedPost.url;
      const domain = serializedPost.domain;
      const url = await parseUrl(rawUrl, domain);

      parsed.push({ ...serializedPost, url });
    } catch {
      skipped.push(serializedPost);
    }
  }

  return { skipped, parsed };
}

function parseComments(rawComments) {
  const comments = rawComments.map(comment => {
    const body = comment.data.body;
    const unacceptedComment = UNACCEPTED_COMMENTS.indexOf(body) !== -1;

    if (!unacceptedComment) {
      return {
        body,
        upvotes_count: comment.data.ups
      };
    }
  });
  const sorted = comments.sort((a, b) => b.upvotes_count - a.upvotes_count);

  return sorted;
}

export default {
  parsePopularSubreddits,
  getApiUrl,
  parsePosts,
  parseUrl,
  parseComments,
  getFilename,
  parsePathname
};
