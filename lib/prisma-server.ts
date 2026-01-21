// lib/prisma-server.ts
// This file is server-only — never import it in "use client" files

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prismaServer: PrismaClient };

const prisma = globalForPrisma.prismaServer || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaServer = prisma;

export default prisma;
