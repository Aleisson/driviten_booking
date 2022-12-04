import { notFoundError, cannotBookingError } from "@/errors";
import bookingRepository from "@/repositories/booking-respository";
import hotelService from "../hotels-service";

async function getBooking( userId: number) {
  await hotelService.getHotels(userId);

  const booking =  await bookingRepository.findBooking(userId);
  if(!booking) {
    throw notFoundError();
  }
  return booking;
}

async function createOrUpdateBooking(userId: number, roomId: number) {
  await hotelService.getHotels(userId);

  const room = await bookingRepository.findRoomById(roomId);

  if(!room) {
    throw notFoundError();
  }
  if(!room.capacity) {
    throw  cannotBookingError();
  }
  const bookingValid = await bookingRepository.findBookingByUser(userId);
  const booking = await bookingRepository.upsert( bookingValid.id, userId, roomId);
  if(!booking) {
    throw notFoundError();
  }
  return booking;
}

const bookingService = {
  getBooking,
  createOrUpdateBooking
};

export default bookingService;
