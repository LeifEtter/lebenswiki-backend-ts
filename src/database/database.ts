import prisma = require("@prisma/client");

/** Creates PrismaClient object for interacting with the Database */
const db: prisma.PrismaClient = new prisma.PrismaClient();

export = db;
