# Micro-reddit

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/malcodeman/micro-reddit/blob/master/LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Microservice for getting direct image | video links from subreddits.

## Usage

Micro reddit requires **node v11.0.0** or higher for [URL module](https://nodejs.org/api/url.html) support.

.env file should look like this:

```
PORT=8080
BEHANCE_API_KEY=123
IMGUR_CLIENT_ID=123
GFYCAT_API_KEY=123
FLICKR_API_KEY=123
```

To start the service run:

```
yarn install
yarn start
```

Client is located [here](https://github.com/malcodeman/reddit-client).

## Design decisions

Why ... ?

- [esm](https://github.com/standard-things/esm) ?
  Since node still doesn't support ECMAScript modules without --experimental-modules flag using esm was necessary to avoid .mjs file extension.
  When node starts supporting modules removing `-r esm` from package.json start script is all that's needed.
- [fastify](https://github.com/fastify/fastify) ?
  Speed.

## Documentation

Routes:

- `/subs/:subreddit/:sort`

- `/posts/:postId`

- `/popular`

Supported third-party services:

- imgur
- behance
- gfycat
- supload
- flickr

## License

Micro reddit is [MIT licensed](./LICENSE).
