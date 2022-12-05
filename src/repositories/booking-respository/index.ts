import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    },
    select: {
      id: true,
      Room: true,
    }
  });
}

async function findBookingByUser(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    }
  });
}

async function findBookingByRoom(roomId: number) {
  return prisma.booking.findFirst({
    where: {
      roomId
    }
  });
}

async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where: {
      id
    }
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    }
  });
}

async function upsert(id: number, userId: number, roomId: number) {
  return prisma.booking.upsert({
    where: {
      id,
    },
    create: {
      userId,
      roomId
    },
    update: {
      roomId,
    }
  });
}

const bookingRepository = {
  findBooking,
  findBookingByUser,
  findBookingById,
  findRoomById,
  findBookingByRoom,
  upsert
};

export default bookingRepository;
