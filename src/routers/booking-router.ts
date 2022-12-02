import { Router } from "express";

const bookingRouter = Router();

bookingRouter.get("/", (req, res) => { res.sendStatus(501); });

export { bookingRouter };

