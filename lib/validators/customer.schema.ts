import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  email: z.string().email("Неверный email").optional(),
  phone: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.extend({
  id: z.number(),
});