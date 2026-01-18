import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Use "next-auth" to extend the core User and Session interfaces
declare module "next-auth" {
  interface Session {
    user: {
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

// Use "next-auth/jwt" to extend the JWT interface used in callbacks
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "ADMIN";
  }
}
