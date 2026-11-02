import { z } from 'zod';
import { PHONE_ERROR } from './phone';

/**
 * Checkout form validation schema using Zod
 */
export const checkoutSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom doit contenir moins de 50 caractères'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom doit contenir moins de 50 caractères'),
  email: z
    .string()
    .email('Veuillez saisir une adresse e-mail valide'),
  phone: z.string().regex(/^\d{8}$/, PHONE_ERROR),

  // Shipping Address
  address: z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(100, "L'adresse doit contenir moins de 100 caractères"),
  city: z
    .string()
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(50, 'La ville doit contenir moins de 50 caractères'),
  zipCode: z
    .string()
    .min(4, 'Le code postal doit contenir au moins 4 caractères')
    .max(10, 'Le code postal doit contenir moins de 10 caractères'),
  country: z
    .string()
    .min(2, 'Veuillez sélectionner un pays'),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

