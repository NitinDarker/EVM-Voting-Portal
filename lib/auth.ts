import jwt from "jsonwebtoken";

export interface AuthUser {
  voter_id: number;
  region_id: number;
  name: string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}
