import app from "./app";

const PORT = process.env.PORT;

app.listen(PORT, (err, address) => {
  if (err) throw err;
  app.log.info(`server listening on ${address}`);
});
