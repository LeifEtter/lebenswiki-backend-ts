import app from "./app";
import db from "./database/database";
import https = require("https");
import fs = require("fs");

async function main() {
  try {
    if (!process.env.JWT_SECRET) {
      console.log("Please set a JWT_SECRET=[RANDOM STRING] in .env");
      return;
    }

    const port: number | undefined = parseInt(process.env.PORT ?? "");
    if (!port) {
      console.log("Please set a PORT=[PORT] in .env");
      return;
    } else {
      console.log(`Using Port = ${port}`);
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
      console.log(
        "Please add a anonymous user, and connect him with Role id=1, and/or make sure he has the following data:"
      );
      console.log("email: anonymous@lebenswiki.com");
      console.log("The other fields can be defined as anything you want.");
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
        console.log(err);
      });
      server.listen(port, (): void => {
        console.log(`Server started on port = ${port}`);
      });
    } else if (environment == "DEVELOPMENT") {
      app.listen(port, () => {
        console.log(`=================================`);
        console.log("Starting Node in Local Dev Mode");
        console.log(`🚀 App listening on the port ${port}`);
        console.log(`=================================`);
      });
    } else {
      console.log("Please define ENV=[PRODUCTION/DEVELOPMENT] in .env");
      return;
    }
  } catch (err) {
    console.log(err);
  }
}

main();
