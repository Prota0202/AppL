import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const characterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  class: z.enum(['WARRIOR', 'MAGE', 'ROGUE']),
  strength: z.number().min(5),
  intelligence: z.number().min(5),
  endurance: z.number().min(5),
  remainingPoints: z.literal(0, {
    errorMap: () => ({ message: "All points must be distributed before submitting." }),
  }),
});

export const skillSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  maxLevel: z.number()
    .min(2, { message: "Max level must be at least 2" })
    .max(100, { message: "Max level must be at most 100" }),
});

export const questFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  difficulty: z.enum(['E', 'D', 'C', 'B', 'A']),
});

export const rewardItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const rewardListSchema = z.array(rewardItemSchema).min(1, "At least one reward item is required");