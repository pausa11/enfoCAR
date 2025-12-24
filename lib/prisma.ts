import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Add connection timeout to DATABASE_URL if not already present
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL || '';
    // Add connection_timeout and pool_timeout parameters if using pgbouncer
    if (url.includes('pgbouncer=true') && !url.includes('connect_timeout')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}connect_timeout=30&pool_timeout=30`;
    }
    return url;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
