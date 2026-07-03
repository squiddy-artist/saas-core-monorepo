import { z } from 'zod';

/**
 * 🧑‍💻 User Base Properties Interface
 * Represents the core structure of a user in the system.
 */
export interface IUserDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * 🪙 Auth Response Payload
 * Standard structure for successful authentication.
 */
export interface IAuthResponse {
  message: string;
  token: string;
  user: IUserDTO;
}

// ==========================================
// 🛡️ AUTHENTICATION VALIDATION SCHEMAS
// ==========================================

/**
 * 📝 Registration Validation Schema
 * Enforces strict criteria for enrolling a new user.
 */
export const RegisterSchema = z.object({
  name: z
    .string({ required_error: 'Name is required 🧑' })
    .min(2, { message: 'Name must be at least 2 characters long 📝' })
    .max(50, { message: 'Name cannot exceed 50 characters 🚫' }),
  
  email: z
    .string({ required_error: 'Email is required 📧' })
    .email({ message: 'Please enter a valid email address ✉️' }),
  
  password: z
    .string({ required_error: 'Password is required 🔑' })
    .min(6, { message: 'Password must be at least 6 characters long 🔐' })
    .max(100, { message: 'Password is too long 🚫' })
    // Regex for basic password complexity
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number 🛡️',
    }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * 🔑 Login Validation Schema
 * Quick validation parameters before trying authentication.
 */
export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required 📧' })
    .email({ message: 'Please enter a valid email address ✉️' }),
  
  password: z
    .string({ required_error: 'Password is required 🔑' })
    .min(1, { message: 'Password cannot be empty 🔐' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
