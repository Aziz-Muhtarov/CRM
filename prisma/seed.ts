import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "123456";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Пользователь создан:");
  console.log("Email: admin@example.com");
  console.log("Пароль: 123456");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });