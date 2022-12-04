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
  findRoomById,
  findBookingByRoom,
  upsert
};

export default bookingRepository;
