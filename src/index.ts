import app from "./app";
import db from "./database/database";
import https = require("https");
import fs = require("fs");
import logger from "./logging/logger";

async function main() {
  try {
    logger.info("Starting application");
    if (!process.env.JWT_SECRET) {
      logger.info("Please set a JWT_SECRET=[RANDOM STRING] in .env");
      return;
    }

    const port: number | undefined = parseInt(process.env.PORT ?? "");
    if (!port) {
      logger.info("Please set a PORT=[PORT] in .env");
      return;
    } else {
      logger.info(`Using Port = ${port}`);
    }

    const anonUser = await db.user.findUnique({
      where: { email: "anonymous@lebenswiki.com" },
      include: {
        role: true,
      },
    });
    if (
      !anonUser ||
      anonUser.email != "anonymous@lebenswiki.com" ||
      anonUser.roleId != 1
    ) {
      logger.info(
        "Please add a anonymous user, and connect him with Role id=1, and/or make sure he has the following data:"
      );
      logger.info("email: anonymous@lebenswiki.com");
      logger.info("The other fields can be defined as anything you want.");
      return;
    }

    const environment: string | undefined = process.env.ENV;
    if (environment == "PRODUCTION") {
      const options: https.ServerOptions = {
        key: fs.readFileSync(
          "/etc/letsencrypt/live/api.lebenswiki.com/privkey.pem"
        ),
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/api.lebenswiki.com/fullchain.pem"
        ),
      };
      const server: https.Server = https.createServer(options, app);
      server.on("uncaughtException", (err) => {
        logger.error(err);
      });
      server.listen(port, (): void => {
        logger.info(`Server started on port = ${port}`);
      });
    } else if (environment == "DEVELOPMENT") {
      app.listen(port, () => {
        logger.info(`=================================`);
        logger.info("Starting Node in Local Dev Mode");
        logger.info(`🚀 App listening on the port ${port}`);
        logger.info(`=================================`);
      });
    } else {
      logger.info("Please define ENV=[PRODUCTION/DEVELOPMENT] in .env");
      return;
    }
  } catch (err) {
    logger.error(err);
  }
}

main();
