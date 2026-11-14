import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Not env('DATABASE_URL'): it throws when unset, which breaks `prisma generate` in postinstall.
    url: process.env.DATABASE_URL ?? '',
  },
});
