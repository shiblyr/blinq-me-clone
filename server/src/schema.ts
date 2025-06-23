
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Auth input schemas
export const signupInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export type SignupInput = z.infer<typeof signupInputSchema>;

export const signinInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export type SigninInput = z.infer<typeof signinInputSchema>;

// Business card schema
export const businessCardSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  title: z.string().nullable(),
  company: z.string().nullable(),
  email: z.string().email().nullable(),
  phone_number: z.string().nullable(),
  linkedin_url: z.string().url().nullable(),
  twitter_url: z.string().url().nullable(),
  instagram_url: z.string().url().nullable(),
  profile_picture_url: z.string().url().nullable(),
  company_logo_url: z.string().url().nullable(),
  unique_url: z.string(),
  qr_code_url: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BusinessCard = z.infer<typeof businessCardSchema>;

// Input schema for creating business cards
export const createBusinessCardInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  profile_picture_url: z.string().url().nullable().optional(),
  company_logo_url: z.string().url().nullable().optional()
});

export type CreateBusinessCardInput = z.infer<typeof createBusinessCardInputSchema>;

// Input schema for updating business cards
export const updateBusinessCardInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  profile_picture_url: z.string().url().nullable().optional(),
  company_logo_url: z.string().url().nullable().optional()
});

export type UpdateBusinessCardInput = z.infer<typeof updateBusinessCardInputSchema>;

// Schema for getting business card by unique URL
export const getBusinessCardByUrlInputSchema = z.object({
  unique_url: z.string()
});

export type GetBusinessCardByUrlInput = z.infer<typeof getBusinessCardByUrlInputSchema>;

// Schema for getting business card by ID
export const getBusinessCardByIdInputSchema = z.object({
  id: z.number()
});

export type GetBusinessCardByIdInput = z.infer<typeof getBusinessCardByIdInputSchema>;

// Schema for generating QR code
export const generateQrCodeInputSchema = z.object({
  id: z.number()
});

export type GenerateQrCodeInput = z.infer<typeof generateQrCodeInputSchema>;
