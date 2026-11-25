import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import type { NestExpressApplication } from '@nestjs/platform-express';

import request from 'supertest';

import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './create-test-app.js';

const ORDERS = '/api/v1/orders';
const TOPPING_CODE = `smoke-burrata-${crypto.randomUUID()}`;

describe('orders: quote → order → idempotent replay (smoke)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const server = () => app.getHttpServer();

  const ids = { pizza: '', drink: '', hidden: '', pizzeria: '' };
  const items = () => [
    {
      productId: ids.pizza,
      size: 'CM35',
      dough: 'TRADITIONAL',
      toppingCodes: [TOPPING_CODE],
      quantity: 1,
    },
    { productId: ids.drink, quantity: 1 },
  ];
  const delivery = () => ({
    items: items(),
    fulfillment: 'DELIVERY',
    name: 'Олена',
    phone: '067 123-45-67',
    address: 'вул. Хрещатик, 22',
  });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const name = { uk: 'Smoke' };
    const [pizza, drink, hidden, pizzeria] = await Promise.all([
      prisma.product.create({ data: { name, category: 'PIZZA', basePrice: 24_900 } }),
      prisma.product.create({ data: { name, category: 'DRINK', basePrice: 7900 } }),
      prisma.product.create({
        data: { name, category: 'DRINK', basePrice: 7900, isVisible: false },
      }),
      prisma.pizzeria.create({ data: { address: { uk: 'Smoke, 1' } } }),
      prisma.topping.create({ data: { code: TOPPING_CODE, name: { uk: 'Бурата' }, price: 7900 } }),
    ]);
    Object.assign(ids, {
      pizza: pizza.id,
      drink: drink.id,
      hidden: hidden.id,
      pizzeria: pizzeria.id,
    });
  });

  afterAll(async () => {
    const productIds = [ids.pizza, ids.drink, ids.hidden];
    await prisma.order.deleteMany({
      where: { items: { some: { productId: { in: productIds } } } },
    });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.pizzeria.deleteMany({ where: { id: ids.pizzeria } });
    await prisma.topping.deleteMany({ where: { code: TOPPING_CODE } });
    await app.close();
  });

  it('quotes delivery below the free threshold (PLAN 4.4: 507 + 79 UAH)', async () => {
    const response = await request(server())
      .post(`${ORDERS}/quote`)
      .send({ items: items(), fulfillment: 'DELIVERY' })
      .expect(200);

    expect(response.body).toMatchObject({
      itemsSubtotal: 50_700,
      pickupDiscount: 0,
      deliveryFee: 7900,
      freeDeliveryRemaining: 9300,
      total: 58_600,
    });
    expect(response.body.items[0]).toMatchObject({ unitPrice: 42_800, size: 'CM35' });
  });

  it('quotes pickup with 5 % off (507 → 482 UAH)', async () => {
    const response = await request(server())
      .post(`${ORDERS}/quote`)
      .send({ items: items(), fulfillment: 'PICKUP' })
      .expect(200);

    expect(response.body).toMatchObject({ pickupDiscount: 2500, deliveryFee: 0, total: 48_200 });
  });

  it('rejects an empty cart and a hidden product', async () => {
    const empty = await request(server())
      .post(`${ORDERS}/quote`)
      .send({ items: [], fulfillment: 'DELIVERY' })
      .expect(409);
    expect(empty.body.code).toBe('CART_EMPTY');

    const hidden = await request(server())
      .post(`${ORDERS}/quote`)
      .send({
        items: [...items(), { productId: ids.hidden, quantity: 1 }],
        fulfillment: 'DELIVERY',
      })
      .expect(409);
    expect(hidden.body).toMatchObject({
      code: 'CART_HAS_UNAVAILABLE_ITEMS',
      details: [{ field: 'items.2', code: 'PRODUCT_UNAVAILABLE' }],
    });
  });

  it('validates contacts, address and options', async () => {
    const response = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', crypto.randomUUID())
      .send({ ...delivery(), name: 'О', phone: '12345', address: 'Хрещатик' })
      .expect(400);

    expect(response.body.details).toEqual([
      { field: 'name', code: 'NAME_TOO_SHORT' },
      { field: 'phone', code: 'PHONE_INVALID' },
      { field: 'address', code: 'ADDRESS_INVALID' },
    ]);
  });

  it('requires the Idempotency-Key header', async () => {
    const response = await request(server()).post(ORDERS).send(delivery()).expect(400);
    expect(response.body.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });

  it('creates one order per key and rejects the key with another body', async () => {
    const key = crypto.randomUUID();
    const first = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', key)
      .send(delivery())
      .expect(201);

    expect(first.body).toMatchObject({
      status: 'ACCEPTED',
      fulfillment: 'DELIVERY',
      contactPhone: '+380671234567',
      paymentMethod: 'ON_RECEIPT',
      total: 58_600,
      etaMinutes: 35,
    });
    expect(first.body.items[0].toppings).toEqual([
      { code: TOPPING_CODE, name: { uk: 'Бурата' }, price: 7900 },
    ]);

    const replay = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', key)
      .send(delivery())
      .expect(201);
    expect(replay.body.id).toBe(first.body.id);
    expect(replay.body.number).toBe(first.body.number);

    const mismatch = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', key)
      .send({ ...delivery(), name: 'Андрій' })
      .expect(409);
    expect(mismatch.body.code).toBe('IDEMPOTENCY_KEY_MISMATCH');
  });

  it('places a pickup order at an active pizzeria', async () => {
    const response = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', crypto.randomUUID())
      .send({
        items: items(),
        fulfillment: 'PICKUP',
        name: 'Олена',
        phone: '+380671234567',
        pizzeriaId: ids.pizzeria,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      pizzeriaId: ids.pizzeria,
      address: null,
      pickupDiscount: 2500,
      total: 48_200,
    });
  });

  it('rejects pickup without a pizzeria or with an unknown one', async () => {
    const missing = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', crypto.randomUUID())
      .send({ items: items(), fulfillment: 'PICKUP', name: 'Олена', phone: '+380671234567' })
      .expect(400);
    expect(missing.body.details).toEqual([{ field: 'pizzeriaId', code: 'PIZZERIA_REQUIRED' }]);

    const unknown = await request(server())
      .post(ORDERS)
      .set('Idempotency-Key', crypto.randomUUID())
      .send({
        items: items(),
        fulfillment: 'PICKUP',
        name: 'Олена',
        phone: '+380671234567',
        pizzeriaId: crypto.randomUUID(),
      })
      .expect(404);
    expect(unknown.body.code).toBe('PIZZERIA_NOT_FOUND');
  });
});
