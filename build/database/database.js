"use strict";
const prisma = require("@prisma/client");
const db = new prisma.PrismaClient();
module.exports = db;
