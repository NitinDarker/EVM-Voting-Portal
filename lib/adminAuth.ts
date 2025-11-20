import jwt from "jsonwebtoken";

export interface AdminUser {
  admin_id: number;
  name: string;
  isAdmin: boolean;
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    return jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as AdminUser;
  } catch {
    return null;
  }
}
