import { request } from "graphql-request";

async function getUrl(suploadUrl) {
  try {
    const url = new URL(suploadUrl).pathname.replace("/", "");
    const query = `{
        image(imageId: "${url}"){
          id
          views
          upvotes
          date
          type
          compressed
          description
          tags
          uname
          title
          width
          height
          albumIds
          private
          album
          copyright
          adult
          images {
            id
            description
            width
            height
            type
            compressed
          }
        }
      }`;
    const suploadApiUrl = "https://supload.com/graphql";
    const res = await request(suploadApiUrl, query);
    const id = res.image.images[0].id;

    return `https://i.supload.com/${id}-hd.mp4`;
  } catch {
    throw new Error("SuploadException");
  }
}

export default {
  getUrl
};
