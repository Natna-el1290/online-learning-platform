import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            throw new Error("Please provide email and password");
          }

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          });

          if (!user) {
            console.error("User not found:", credentials.email);
            throw new Error("Invalid email or password");
          }

          // Check if user has password (OAuth users may not have one)
          if (!user.password) {
            console.error("No password set for user:", credentials.email);
            throw new Error("Please sign in with your social account");
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            throw new Error("Invalid email or password");
          }

          // Check if email is verified (optional, based on your requirements)
          if (
            !user.emailVerified &&
            process.env.REQUIRE_EMAIL_VERIFICATION === "true"
          ) {
            console.error("Email not verified:", credentials.email);
            throw new Error("Please verify your email first");
          }

          // Return user data for JWT token
          return {
            id: user.id,
            email: user.email,
            name:
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              user.email,
            role: user.role || "STUDENT",
          };
        } catch (error) {
          console.error("Authorization error:", error);
          // Return null to indicate failed authorization
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Allow all sign in attempts - we'll handle errors in authorize callback
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, profile, trigger, session }) {
      try {
        // Initial sign in
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = (user as any).role || "STUDENT";

          // Fetch fresh user data from database to ensure role is up to date
          if (user.id) {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true, emailVerified: true },
            });

            if (dbUser) {
              token.role = dbUser.role;
            }
          }
        }

        // Handle session update (if triggered from client)
        if (trigger === "update" && session?.user) {
          token.role = session.user.role;
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token, user }) {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.role = (token.role as "ADMIN" | "STUDENT") || "STUDENT";

          // Ensure we always have a valid role
          if (!session.user.role) {
            session.user.role = "STUDENT";
          }
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        // Redirect to the provided callback URL or dashboard based on role
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // Default redirect to home page
        return baseUrl;
      } catch (error) {
        console.error("Redirect callback error:", error);
        return baseUrl;
      }
    },
  },

  events: {
    async createUser({ user }) {
      try {
        // Ensure OAuth users get a default role
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "STUDENT",
            // Set email as verified for OAuth users
            emailVerified: new Date(),
          },
        });
        console.log("Created user with default role:", user.email);
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },

    async signIn({ user, account, isNewUser }) {
      try {
        if (isNewUser && account?.provider !== "credentials") {
          // Update OAuth users with verified email
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }
      } catch (error) {
        console.error("Error in signIn event:", error);
      }
    },
  },

  // Add debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Add cookies configuration for better security
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
};
