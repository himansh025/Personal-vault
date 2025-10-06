export interface User {
  _id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultItem {
  _id: string;
  userId: string;
  title: string;
  username: string;
  password: string; // encrypted
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultItemForm {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeLookalikes: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  userId?: string;
  error?: string;
}

