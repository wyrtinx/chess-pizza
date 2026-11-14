import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Not env('DATABASE_URL'): it throws when the variable is missing, and
    // `prisma generate` (postinstall, CI, Docker build) must work without a database.
    // Commands that do need a database fail on their own with an empty URL.
    url: process.env.DATABASE_URL ?? '',
  },
});
