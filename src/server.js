import app from "./app";

const PORT = process.env.PORT;

async function start() {
  try {
    await app.listen(PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
