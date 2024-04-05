import { Request } from "express";
import cors = require("cors");

// const origins: Array<string> = [
//   "https://lebenswiki.com",
//   "https://editor.lebenswiki.com",
//   "http://localhost:54721",
//   process.env.ORIGIN ?? "",
// ];

// const corsOptionsDelegate: cors.CorsOptionsDelegate = function (
//   req: cors.CorsRequest,
//   callback: (error: string | null, corsOptions: cors.CorsOptions) => void
// ) {
//   let corsOptions: cors.CorsOptions;
//   if (!req.header("Origin")) {
//     corsOptions = { origin: true };
//   } else if (origins.indexOf(req.header("Origin")!) !== -1) {
//     corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false }; // disable CORS for this request
//   }
//   callback(null, corsOptions); // callback expects two parameters: error and options
// };

// export = corsOptionsDelegate;
