import { PrismaClient } from "@prisma/client";

export const db= globalThis.prisma || new PrismaClient();

if(process.env.NODE_ENV !=="production"){
    globalThis.prisma=db;
}


// In development, Next.js reloads modules when you change files.
// Without this pattern, a new Prisma Client instance would be created each time, leading to:
// Too many database connections (which can crash your database).
// Performance issues due to unnecessary Prisma instances.
// By storing the Prisma instance in globalThis, it persists across module reloads, reducing database connection issues.