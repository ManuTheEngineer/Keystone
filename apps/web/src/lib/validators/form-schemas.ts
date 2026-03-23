/**
 * Zod schemas for client-side form validation.
 *
 * Used with React Hook Form via @hookform/resolvers/zod.
 * These validate user input BEFORE it reaches the API.
 */
import { z } from "zod";

// ── Auth Forms ──────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
  market: z.enum(["USA", "TOGO", "GHANA", "BENIN"], {
    message: "Please select your primary market",
  }),
  agreedToTerms: z.literal(true, {
    message: "You must agree to the terms of service",
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ── Project Forms ───────────────────────────────────────────────────

export const budgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  estimatedCost: z
    .number({ message: "Enter a valid number" })
    .min(0, "Cost cannot be negative"),
  actualCost: z
    .number({ message: "Enter a valid number" })
    .min(0, "Cost cannot be negative")
    .default(0),
  notes: z.string().optional(),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role or trade is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const dailyLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  weather: z.string().optional(),
  crewCount: z
    .number({ message: "Enter a number" })
    .int()
    .min(0, "Crew count cannot be negative")
    .optional(),
  content: z.string().min(1, "Log entry content is required"),
  notes: z.string().optional(),
});

export type DailyLogFormData = z.infer<typeof dailyLogSchema>;

export const punchListItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  trade: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

export type PunchListItemFormData = z.infer<typeof punchListItemSchema>;

// ── Settings Forms ──────────────────────────────────────────────────

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().min(1, "Currency is required"),
  locale: z.string().min(1, "Language is required"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
