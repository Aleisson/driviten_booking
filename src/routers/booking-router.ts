import { Router } from "express";
import * as controllers from "@/controllers/booking-controller";
const bookingRouter = Router();

bookingRouter.get("/", controllers.getBooking);

export { bookingRouter };

