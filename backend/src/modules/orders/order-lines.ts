import type { ErrorDetail } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import type { LocalizedTextDto } from '../../common/localized-text/localized-text.dto.js';
import type { Dough, PizzaSize } from '../../pricing/pricing.constants.js';
import { lineTotal, unitPrice, type PricedProduct } from '../../pricing/unit-price.js';

export interface LineInput {
  productId: string;
  size?: PizzaSize;
  dough?: Dough;
  toppingCodes?: readonly string[];
  quantity: number;
}

export interface CatalogProduct extends PricedProduct {
  id: string;
  name: LocalizedTextDto;
  available: boolean;
}

export interface CatalogTopping {
  code: string;
  name: LocalizedTextDto;
  price: number;
}

export interface ResolvedLine {
  productId: string;
  name: LocalizedTextDto;
  category: PricedProduct['category'];
  size: PizzaSize | null;
  dough: Dough | null;
  toppings: CatalogTopping[];
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ResolvedLines {
  lines: ResolvedLine[];
  unavailable: ErrorDetail[];
  invalidOptions: ErrorDetail[];
}

export function resolveLines(
  inputs: readonly LineInput[],
  products: ReadonlyMap<string, CatalogProduct>,
  toppings: ReadonlyMap<string, CatalogTopping>,
): ResolvedLines {
  const result: ResolvedLines = { lines: [], unavailable: [], invalidOptions: [] };

  inputs.forEach((input, index) => {
    const field = `items.${index}`;
    const product = products.get(input.productId);

    if (!product?.available) {
      result.unavailable.push({ field, code: ErrorCode.PRODUCT_UNAVAILABLE });
      return;
    }

    const chosen = chosenToppings(product, input, toppings);
    if (chosen === null) {
      result.invalidOptions.push({ field, code: ErrorCode.PRODUCT_OPTIONS_INVALID });
      return;
    }

    const isPizza = product.category === 'PIZZA';
    const size = isPizza ? (input.size ?? null) : null;
    const dough = isPizza ? (input.dough ?? null) : null;
    const price = unitPrice(product, { size, dough, toppings: chosen });

    result.lines.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      size,
      dough,
      toppings: chosen,
      unitPrice: price,
      quantity: input.quantity,
      lineTotal: lineTotal(price, input.quantity),
    });
  });

  return result;
}

/** `null` when the options do not fit the product. */
function chosenToppings(
  product: CatalogProduct,
  input: LineInput,
  toppings: ReadonlyMap<string, CatalogTopping>,
): CatalogTopping[] | null {
  const codes = input.toppingCodes ?? [];

  if (product.category !== 'PIZZA') {
    const hasOptions = input.size !== undefined || input.dough !== undefined || codes.length > 0;
    return hasOptions ? null : [];
  }

  if (input.size === undefined || input.dough === undefined) return null;
  if (new Set(codes).size !== codes.length) return null;

  const chosen = codes.map((code) => toppings.get(code));
  if (chosen.some((topping) => topping === undefined)) return null;

  return chosen
    .filter((topping): topping is CatalogTopping => topping !== undefined)
    .toSorted((a, b) => a.code.localeCompare(b.code));
}
