import app from "./app";

const PORT = process.env.PORT;

function start() {
  try {
    app.listen(PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
