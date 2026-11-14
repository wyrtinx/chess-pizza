import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { hashPassword } from '../src/modules/auth/password.js';
import { readAdminSeed } from './seed-admin.js';
import { PIZZERIAS, PRODUCTS, TOPPINGS } from './seed-data.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const admin = readAdminSeed();
const adminPasswordHash = await hashPassword(admin.password);
const now = new Date();

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  await prisma.$transaction([
    // Existing products are left untouched so that a re-run does not undo admin edits.
    ...PRODUCTS.map((product) =>
      prisma.product.upsert({ where: { id: product.id }, create: product, update: {} }),
    ),
    ...TOPPINGS.map((topping) =>
      prisma.topping.upsert({ where: { code: topping.code }, create: topping, update: topping }),
    ),
    ...PIZZERIAS.map((pizzeria) =>
      prisma.pizzeria.upsert({ where: { id: pizzeria.id }, create: pizzeria, update: pizzeria }),
    ),
    // The password is set only on creation: a re-run must not reset a changed one.
    prisma.user.upsert({
      where: { email: admin.email },
      create: {
        email: admin.email,
        passwordHash: adminPasswordHash,
        name: admin.name,
        role: 'ADMIN',
        locale: 'uk',
        emailVerifiedAt: now,
        termsAcceptedAt: now,
      },
      update: { role: 'ADMIN' },
    }),
  ]);
} finally {
  await prisma.$disconnect();
}
