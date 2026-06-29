import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";

const hash = await bcrypt.hash("test", 10);

await prisma.firm.create({
  data: {
    email: "test@test.com",
    password: hash,
    name: "Attorney & Law LLC",
  },
});

console.log("User created");
await prisma.$disconnect();
