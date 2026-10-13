import { z } from "zod";

// Zod schema for individual cart item validation
export const OrderItemSchema = z.object({
  id: z.coerce.string().min(1, "Dish ID is required"),
  name: z.string().trim().min(1, "Dish name is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  qty: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
  image: z.string().optional().default(""),
  desc: z.string().optional().default(""),
});

// Zod schema for customer checkout billing details
export const CustomerDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  companyName: z.string().optional().default(""),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z.string().trim().min(6, "Phone number must be at least 6 digits"),
  country: z.string().trim().min(1, "Country is required").default("Ethiopia"),
  address: z.string().trim().min(3, "Street address is required"),
  zipCode: z.string().optional().default(""),
  city: z.string().trim().min(1, "City / Town is required"),
  orderNotes: z.string().max(500, "Notes cannot exceed 500 characters").optional().default(""),
  createAccount: z.boolean().optional().default(false),
});

// Complete Order submission schema
export const OrderSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, "Your cart must contain at least one item to place an order"),
  customer: CustomerDetailsSchema,
  paymentMethod: z
    .enum(["telebirr", "bank_transfer", "cash_delivery", "check_payments"], {
      message: "Invalid payment method selected",
    })
    .default("telebirr"),
});
