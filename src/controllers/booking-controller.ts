import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  res.sendStatus(501);
}
