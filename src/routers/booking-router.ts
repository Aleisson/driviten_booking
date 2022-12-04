import { Router } from "express";
import * as controllers from "@/controllers/booking-controller";
import { authenticateToken } from "@/middlewares";
const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)  
  .get("/", controllers.getBooking)
  .put("/", controllers.postCreateOrUpdateBooking);

export { bookingRouter };

