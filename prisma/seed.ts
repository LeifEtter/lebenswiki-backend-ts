import { PrismaClient, User } from "@prisma/client";
const db = new PrismaClient();

const createRoles = async () => {
  await db.role.deleteMany();
  await db.role.createMany({
    data: [
      {
        id: 1,
        accessLevel: 1,
        name: "Anonymous",
      },
      {
        id: 2,
        accessLevel: 2,
        name: "User",
      },
      {
        id: 3,
        accessLevel: 3,
        name: "Creator",
      },
      {
        id: 4,
        accessLevel: 10,
        name: "Admin",
      },
    ],
  });
};

const createAnonymousUser = async () => {
  await db.user.delete({
    where: {
      email: "anonymous@lebenswiki.com",
    },
  });
  const user = await db.user.create({
    data: {
      name: "Anonymous User",
      email: "anonymous@lebenswiki.com",
      password: "SomePassword@1234",
      biography: "The default profile for anonymous users",
      isFirstLogin: false,
    },
  });
  await db.user.update({
    where: { id: user.id },
    data: {
      role: {
        connect: {
          id: 1,
        },
      },
    },
  });
};

const createCategories = async () => {
  await db.category.deleteMany();
  await db.category.createMany({
    data: [
      { id: 1, categoryName: "Beruf" },
      { id: 2, categoryName: "Finanzen" },
      { id: 3, categoryName: "Versicherungen" },
      { id: 4, categoryName: "Wohnen" },
      { id: 5, categoryName: "Steuern" },
      { id: 6, categoryName: "Gesundheit" },
    ],
  });
};

async function main() {
  try {
    await createRoles();
    await createAnonymousUser();
    await createCategories();
  } catch (error) {
    console.log(error);
  }
}
main();
