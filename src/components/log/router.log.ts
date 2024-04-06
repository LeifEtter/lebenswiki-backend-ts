import { Router } from "express";
import { catchLog } from "./controller.log";

const router: Router = Router();

router.route("/").post(catchLog);

export default router;
