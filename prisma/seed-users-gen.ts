import { PackPage, PrismaClient, User } from "@prisma/client";
import { randomInt } from "crypto";
const db = new PrismaClient();
import * as fakerator from "fakerator";
const fake = fakerator.default("de-DE");
const name = fake.names.name();

function shuffle(array: number[]): number[] {
  let currentIndex = array.length,
    randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function createDummyUsers(): Promise<number[]> {
  const userIdList: number[] = [];
  for (let i: number = 0; i < 1000; i++) {
    const email: string = fake.internet.email();
    const existingUserWithEmail = await db.user.findFirst({
      where: { email: email },
    });
    if (!existingUserWithEmail) {
      const user = await db.user.create({
        data: {
          email: email,
          name: fake.names.name(),
          biography: fake.lorem.sentence(),
          password: fake.internet.password(),
        },
      });
      userIdList.push(user.id);
    }
  }
  return userIdList;
}

async function getAllPacksAsIds(): Promise<number[]> {
  const packs = await db.pack.findMany({
    where: {
      published: true,
    },
  });
  const packIds = packs.map((pack) => pack.id);
  return packIds;
}

async function useDummyUsersToClap() {
  let shuffledUsers: number[];
  const packIds: number[] = await getAllPacksAsIds();
  const userIds: number[] = await createDummyUsers();

  for (const packId of packIds) {
    shuffledUsers = shuffle(userIds);
    const clapAmount = randomIntFromInterval(100, 500);
    const clappingUsers = shuffledUsers.slice(0, clapAmount);
    for (const userId of clappingUsers) {
      await db.pack.update({
        where: {
          id: packId,
        },
        data: {
          User_userClap: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }
    const readAmount: number =
      clapAmount * (randomIntFromInterval(11, 16) / 10);
    const readingUsers = shuffledUsers.slice(0, readAmount);
    for (const userId of readingUsers) {
      await db.pack.update({
        where: {
          id: packId,
        },
        data: {
          Read: {
            create: {
              userId: userId,
            },
          },
        },
      });
    }
  }
}

async function main() {
  try {
    await useDummyUsersToClap();
  } catch (error) {
    console.log(error);
  }
}
main();
