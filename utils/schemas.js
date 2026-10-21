import { z } from "zod";
const category = z.enum(["ELECTRONICS", "BAGS", "CLOTHING", "BOOKS", "ID_CARDS", "KEYS", "ACCESSORIES", "OTHER"]);
export const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email(), password: z.string().min(8).max(100) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const reportSchema = z.object({ reportType: z.enum(["LOST", "FOUND"]), title: z.string().trim().min(3).max(120), description: z.string().trim().min(5).max(2000), category, broadLocation: z.string().trim().min(2).max(120), eventDate: z.coerce.date(), privateIdentifiers: z.string().max(1000).optional(), storageLocation: z.string().max(300).optional(), desk: z.string().optional() });
export const reportInputSchema = reportSchema.omit({ reportType: true });
export const claimSchema = z.object({ privateEvidence: z.string().trim().min(5).max(2000), distinguishingDetails: z.string().max(1000).optional() });
export const chatSchema = z.object({ message: z.string().trim().min(2).max(1000), conversationId: z.string().optional() });
export const matchSchema = z.object({ description: z.string().trim().min(3).max(1000), category: category.optional(), broadLocation: z.string().max(120).optional(), afterDate: z.coerce.date().optional(), beforeDate: z.coerce.date().optional() });
