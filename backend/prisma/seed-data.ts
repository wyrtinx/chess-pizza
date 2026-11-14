import type { Prisma } from '../src/generated/prisma/client.js';

type ProductSeed = Prisma.ProductCreateInput & { id: string };
type PizzeriaSeed = Prisma.PizzeriaCreateInput & { id: string };

// Products without an explicit createdAt are created "now" and carry the "new" label for 30 days.
const LONG_AGO = new Date('2026-01-01T00:00:00.000Z');

export const PRODUCTS: ProductSeed[] = [
  {
    id: '01a1d81d-c77b-77e6-be96-2a6d47e8869f',
    name: { uk: 'Маргарита', en: 'Margherita' },
    description: {
      uk: 'Сан-Марцано, фіор-ді-латте, базилік',
      en: 'San Marzano, fior di latte, basil',
    },
    category: 'PIZZA',
    basePrice: 24_900,
    weightGrams: 520,
    isVegetarian: true,
    sortOrder: 1,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77e7-bded-6b6ab21a902c',
    name: { uk: 'Пепероні Піканте', en: 'Pepperoni Piccante' },
    description: {
      uk: 'Пепероні, чилі, каштановий мед',
      en: 'Pepperoni, chilli, chestnut honey',
    },
    category: 'PIZZA',
    basePrice: 29_900,
    weightGrams: 560,
    spicyLevel: 3,
    sortOrder: 2,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77e8-8336-460fa76855e6',
    name: { uk: 'Чотири сири', en: 'Quattro Formaggi' },
    description: {
      uk: 'Горгондзола, пармезан, моцарела, скаморца',
      en: 'Gorgonzola, parmesan, mozzarella, scamorza',
    },
    category: 'PIZZA',
    basePrice: 32_900,
    weightGrams: 540,
    isVegetarian: true,
    sortOrder: 3,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77e9-a6bb-3de118c92391',
    name: { uk: 'Прошуто-фунгі', en: 'Prosciutto e Funghi' },
    description: {
      uk: 'Прошуто котто, печериці, чебрець',
      en: 'Prosciutto cotto, mushrooms, thyme',
    },
    category: 'PIZZA',
    basePrice: 33_500,
    weightGrams: 580,
    sortOrder: 4,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77ea-a491-e24e45dda0c8',
    name: { uk: 'Діавола', en: 'Diavola' },
    description: { uk: 'Салямі, халапеньо, орегано', en: 'Salami, jalapeño, oregano' },
    category: 'PIZZA',
    basePrice: 31_900,
    weightGrams: 570,
    spicyLevel: 4,
    sortOrder: 5,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77eb-83a7-87775137c620',
    name: { uk: 'Лимонад тархун', en: 'Tarragon lemonade' },
    description: { uk: 'Домашній, 0,4 л', en: 'House-made, 0.4 l' },
    category: 'DRINK',
    basePrice: 7900,
    volumeMl: 400,
    isVegetarian: true,
    sortOrder: 6,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77ec-8b46-3f138e2fe5e8',
    name: { uk: 'Тартуфо', en: 'Tartufo' },
    description: {
      uk: 'Трюфельний крем, печериці, пармезан',
      en: 'Truffle cream, mushrooms, parmesan',
    },
    category: 'PIZZA',
    basePrice: 37_900,
    weightGrams: 550,
    isVegetarian: true,
    sortOrder: 7,
  },
  {
    id: '01a1d81d-c77b-77ed-8cff-74669cce6907',
    name: { uk: 'Тирамісу', en: 'Tiramisu' },
    description: { uk: 'Маскарпоне, савоярді, еспресо', en: 'Mascarpone, savoiardi, espresso' },
    category: 'DESSERT',
    basePrice: 13_900,
    weightGrams: 180,
    isVegetarian: true,
    sortOrder: 8,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77ee-8845-98a2183d9d5d',
    name: { uk: 'Верде', en: 'Verde' },
    description: {
      uk: 'Песто, рукола, кедровий горіх, бурата',
      en: 'Pesto, arugula, pine nuts, burrata',
    },
    category: 'PIZZA',
    basePrice: 28_500,
    weightGrams: 500,
    isVegetarian: true,
    sortOrder: 9,
  },
  {
    id: '01a1d81d-c77b-77ef-af35-f61af4fd9623',
    name: { uk: 'Кальцоне Рокіровка', en: 'Calzone Castling' },
    description: {
      uk: 'Закрита: рикота, шпинат, мортадела',
      en: 'Folded: ricotta, spinach, mortadella',
    },
    category: 'PIZZA',
    basePrice: 30_500,
    weightGrams: 480,
    spicyLevel: 1,
    isVisible: false,
    sortOrder: 10,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77f0-bf43-54182047a722',
    name: { uk: 'Апельсиновий сік', en: 'Orange juice' },
    description: { uk: 'Свіжовичавлений, 0,3 л', en: 'Freshly squeezed, 0.3 l' },
    category: 'DRINK',
    basePrice: 9500,
    volumeMl: 300,
    isVegetarian: true,
    sortOrder: 11,
    createdAt: LONG_AGO,
  },
  {
    id: '01a1d81d-c77b-77f1-b489-0051031ba88a',
    name: { uk: 'Канольо', en: 'Cannolo' },
    description: { uk: 'Рикота, цукати, фісташка', en: 'Ricotta, candied fruit, pistachio' },
    category: 'DESSERT',
    basePrice: 10_900,
    weightGrams: 120,
    isVegetarian: true,
    sortOrder: 12,
  },
];

export const TOPPINGS: Prisma.ToppingCreateInput[] = [
  { code: 'burrata', name: { uk: 'Бурата', en: 'Burrata' }, price: 7900, sortOrder: 1 },
  {
    code: 'double-cheese',
    name: { uk: 'Подвійний сир', en: 'Double cheese' },
    price: 4900,
    sortOrder: 2,
  },
  { code: 'pepperoni', name: { uk: 'Пепероні', en: 'Pepperoni' }, price: 5500, sortOrder: 3 },
  { code: 'bacon', name: { uk: 'Бекон', en: 'Bacon' }, price: 5500, sortOrder: 4 },
  { code: 'ham', name: { uk: 'Шинка', en: 'Ham' }, price: 4900, sortOrder: 5 },
  { code: 'parmesan', name: { uk: 'Пармезан', en: 'Parmesan' }, price: 4500, sortOrder: 6 },
  { code: 'jalapeno', name: { uk: 'Халапеньо', en: 'Jalapeño' }, price: 3500, sortOrder: 7 },
  { code: 'mushrooms', name: { uk: 'Печериці', en: 'Mushrooms' }, price: 3500, sortOrder: 8 },
  { code: 'olives', name: { uk: 'Оливки', en: 'Olives' }, price: 3500, sortOrder: 9 },
  {
    code: 'cherry-tomatoes',
    name: { uk: 'Томати чері', en: 'Cherry tomatoes' },
    price: 3500,
    sortOrder: 10,
  },
  { code: 'arugula', name: { uk: 'Рукола', en: 'Arugula' }, price: 2900, sortOrder: 11 },
  {
    code: 'red-onion',
    name: { uk: 'Червона цибуля', en: 'Red onion' },
    price: 2500,
    sortOrder: 12,
  },
];

export const PIZZERIAS: PizzeriaSeed[] = [
  {
    id: '01a1d81d-c77b-77f2-887f-47a26f11247c',
    address: { uk: 'Хрещатик, 20', en: '20 Khreshchatyk St' },
    sortOrder: 1,
  },
  {
    id: '01a1d81d-c77b-77f3-aae7-84def93c5f59',
    address: { uk: 'Сагайдачного, 12', en: '12 Sahaidachnoho St' },
    sortOrder: 2,
  },
  {
    id: '01a1d81d-c77b-77f4-92a1-1042f23658ef',
    address: { uk: 'Лесі Українки, 8', en: '8 Lesi Ukrainky Blvd' },
    sortOrder: 3,
  },
];
