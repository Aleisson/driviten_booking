import { ApplicationError } from "@/protocols";

export function cannotBookingError(): ApplicationError {
  return {
    name: "CannotPermitBooking",
    message: "Cannot booking Room!",
  };
}
