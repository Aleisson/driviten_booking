import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-respository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelService from "../hotels-service";

async function getBooking( userId: number) {
  await hotelService.getHotels(userId);

  const booking =  await bookingRepository.findBooking(userId);
  if(!booking) {
    throw notFoundError();
  }
  return booking;
}

const bookingService = {
  getBooking,
};

export default bookingService;
