import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface VoterPayload {
  voter_id: number;
  name: string;
  region_id: number;
  iat: number;
  exp: number;
}

export function verifyVoterToken(token: string): VoterPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as VoterPayload;
    return decoded;
  } catch (err) {
    console.error("VOTER TOKEN ERROR:", err);
    return null;
  }
}
