# Chess Pizza — бекенд

API сайту Chess Pizza: NestJS 12 на Bun, TypeScript 6, ESM, PostgreSQL 18 через Prisma.

## Запуск

Потрібні Bun і Docker Desktop. Команди встановлення й Docker — з кореня монорепо (lock-файл один, `bun.lock` у корені):

```bash
bun install      # ставить залежності й генерує клієнт Prisma
bun run db:up    # Postgres і Mailpit у Docker, чекає, поки стануть healthy
```

У `backend/` створіть `.env` і `.env.test` за зразком `.env.example` (значення для локального Docker — у коментарях файлу). Далі — з папки `backend/`:

```bash
bun run start:dev    # розробка: збирання nest build + перезапуск під Bun
bun run build        # збирання в dist/
bun run start:prod   # запуск зібраного: bun dist/main.js
```

Перевірка: `GET http://localhost:3000/api/v1/health` → `{ "status": "ok" }`.

Документація API (Scalar): <http://localhost:3000/docs> — якщо `DOCS_ENABLED=true`. Ендпоінти описані там, а не в цьому файлі; контракт для фронтенду — `openapi.json` (оновлюється скриптом `openapi` після кожної зміни API).

Запускати `.ts` напряму через Bun не можна: збирає тільки `nest build`, бо разом із ним працює CLI-плагін Swagger.

## Локальні сервіси (Docker Compose)

| Сервіс   | Адреса                  | Навіщо                                             |
| -------- | ----------------------- | -------------------------------------------------- |
| Postgres | `localhost:5432`        | бази `chess_pizza` (розробка) і `chess_pizza_test` |
| Mailpit  | `localhost:1025` (SMTP) | приймає всю пошту локально й у тестах              |
| Mailpit  | <http://localhost:8025> | перегляд листів і HTTP API                         |

Користувач і пароль Postgres — `chess` / `chess`. Порти відкриті лише на `localhost`.

`bun run db:down` (з кореня) зупиняє контейнери; дані бази лишаються в томі `chess-pizza_postgres-data`.

## Скрипти

| Скрипт        | Що робить                                              |
| ------------- | ------------------------------------------------------ |
| `build`       | `nest build` (tsc + CLI-плагін Swagger)                |
| `start`       | зібрати й запустити під Bun                            |
| `start:dev`   | те саме з перезапуском при зміні файлів                |
| `start:prod`  | `bun dist/main.js`                                     |
| `typecheck`   | `tsc --noEmit`                                         |
| `test`        | `bun test` — smoke-тести потребують `db:up`            |
| `test:watch`  | `bun test --watch`                                     |
| `openapi`     | зібрати й записати контракт API в `openapi.json`       |
| `db:generate` | згенерувати клієнт Prisma в `src/generated/prisma`     |
| `db:migrate`  | `prisma migrate dev` — створити й застосувати міграцію |
| `db:studio`   | Prisma Studio                                          |

З кореня монорепо: `bun run lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `build`, `openapi`, `db:up`, `db:down`.

## Змінні оточення

Перевіряються схемою при старті: без потрібної змінної або з неправильним значенням застосунок не запускається. Bun сам читає `.env`, а під час `bun test` — ще й `.env.test`.

| Змінна         | За замовчуванням | Навіщо                                                                 |
| -------------- | ---------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`     | —                | `development`, `test` або `production`                                 |
| `PORT`         | `3000`           | порт HTTP-сервера                                                      |
| `DATABASE_URL` | —                | рядок підключення до PostgreSQL (`postgresql://…`)                     |
| `CORS_ORIGINS` | —                | дозволені origin фронтенду через кому (`http://localhost:5173`)        |
| `TRUST_PROXY`  | `0`              | скільки проксі перед застосунком: `0` локально, `1` за проксі хостингу |
| `DOCS_ENABLED` | `false`          | `true` — документація API на `/docs`                                   |
| `LOG_LEVEL`    | `info`           | рівень логів pino; `silent` вимикає (зручно в `.env.test`)             |
| `BODY_LIMIT`   | `100kb`          | ліміт розміру JSON-тіла запиту                                         |
