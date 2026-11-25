export const ORDER_ITEMS_MAX = 30;
export const ITEM_QUANTITY_MIN = 1;
export const ITEM_QUANTITY_MAX = 99;

export const CONTACT_NAME_MIN_LENGTH = 2;
export const CONTACT_NAME_MAX_LENGTH = 100;
export const ADDRESS_MIN_LENGTH = 5;
export const ADDRESS_MAX_LENGTH = 200;
export const COURIER_COMMENT_MAX_LENGTH = 500;

export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
export const IDEMPOTENCY_KEY_PATTERN = /^[\w-]{8,100}$/;
export const IDEMPOTENCY_KEY_TTL_MS = 24 * 60 * 60 * 1000;
export const GUEST_IDEMPOTENCY_SCOPE = 'guest';
