# Chess Pizza — бекенд

API сайту Chess Pizza: NestJS 12 на Bun, TypeScript 6, ESM.

## Запуск

Усі команди встановлення — з кореня монорепо (lock-файл один, `bun.lock` у корені):

```bash
bun install
```

Далі — з папки `backend/`:

```bash
bun run start:dev    # розробка: збирання nest build + перезапуск під Bun
bun run build        # збирання в dist/
bun run start:prod   # запуск зібраного: bun dist/main.js
```

Сервер слухає порт із `PORT` (за замовчуванням `3000`).

Запускати `.ts` напряму через Bun не можна: збирає тільки `nest build`, бо разом із ним працює CLI-плагін Swagger.

## Скрипти

| Скрипт       | Що робить                               |
| ------------ | --------------------------------------- |
| `build`      | `nest build` (tsc + CLI-плагін Swagger) |
| `start`      | зібрати й запустити під Bun             |
| `start:dev`  | те саме з перезапуском при зміні файлів |
| `start:prod` | `bun dist/main.js`                      |
| `typecheck`  | `tsc --noEmit`                          |
| `test`       | `bun test`                              |
| `test:watch` | `bun test --watch`                      |

Лінтер і форматер — спільні для монорепо, запускаються з кореня: `bun run lint`, `bun run lint:fix`, `bun run format`, `bun run format:check`. З кореня доступні й `typecheck`, `test`, `build`.

## Змінні оточення

| Змінна | За замовчуванням | Навіщо            |
| ------ | ---------------- | ----------------- |
| `PORT` | `3000`           | порт HTTP-сервера |
