import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { PIZZERIAS, PRODUCTS, TOPPINGS } from './seed-data.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

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
  ]);
} finally {
  await prisma.$disconnect();
}
