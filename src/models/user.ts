/**
 * User Models
 */

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: 'Customer' | 'Admin' | 'Seller' | 'Delivery';
}

export interface UpdateUserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

export interface NewDeliveryPerson {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface UserPage {
  items: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
