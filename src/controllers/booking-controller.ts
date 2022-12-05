import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingServices from "@/services/booking-service";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingServices.getBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "CannotListHotelsError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { userId } = req;

  if(roomId <= 0 || roomId > 2147483647) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }

  try {
    const booking = await bookingServices.createOrUpdateBooking(0, userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "CannotListHotelsError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if(error.name ===  "CannotPermitBooking") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function putBoooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const bookingId = Number(req.params.bookingId);
  const { userId } = req;
  
  if(roomId <= 0 || roomId > 2147483647) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }

  if(bookingId <= 0 || bookingId > 2147483647) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
  
  try {
    const booking = await bookingServices.createOrUpdateBooking(bookingId, userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "CannotListHotelsError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if(error.name ===  "CannotPermitBooking") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
