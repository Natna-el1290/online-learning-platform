import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

/**
 * next-auth module augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      /** Database user id */
      id: string;
      role: "STUDENT" | "ADMIN";
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "STUDENT" | "ADMIN";
    firstName?: string;
    lastName?: string;
  }
}

/**
 * JWT module augmentation
 */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** Database user id */
    id: string;
    role: "STUDENT" | "ADMIN";
  }
}
