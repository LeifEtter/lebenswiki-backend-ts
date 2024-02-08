import prisma = require("@prisma/client");

const db: prisma.PrismaClient = new prisma.PrismaClient();

export = db;
