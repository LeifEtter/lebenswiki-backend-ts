import pino from "pino";

const fileTransport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      options: {},
    },
    {
      target: "pino/file",
      options: { destination: `${__dirname}/app.log` },
    },
  ],
});

const logger = pino(fileTransport);

export default logger;
