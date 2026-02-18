"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createCustomerSchema, updateCustomerSchema } from "@/lib/validators/customer.schema";

export async function createCustomer(formData: FormData) {
  const user = await getAuthUser();
  if (!user) throw new Error("Не авторизован");

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };

  const data = createCustomerSchema.parse(rawData);

  await prisma.customer.create({
    data: {
      ...data,
      userId: Number(user.id),
    },
  });

  revalidatePath("/customers");
}

  export async function deleteCustomer(customerId: number) {
  const user = await getAuthUser();
  if (!user) throw new Error("Не авторизован");

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      userId: Number(user.id),
    },
  });

  if (!customer) {
    throw new Error("Клиент не найден");
  }

  await prisma.customer.delete({
    where: { id: customerId },
  });

  revalidatePath("/customers");
}

export async function updateCustomer(data: {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}) {
  const user = await getAuthUser();
  if (!user) throw new Error("Не авторизован");

  const parsed = updateCustomerSchema.parse(data);

  const customer = await prisma.customer.findFirst({
    where: {
      id: parsed.id,
      userId: Number(user.id),
    },
  });

  if (!customer) throw new Error("Клиент не найден");

  await prisma.customer.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
    },
  });

  revalidatePath("/customers");
}