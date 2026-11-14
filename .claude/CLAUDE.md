# Chess Pizza

## Монорепо

Один репозиторій на **Bun workspaces**:

```
chess-pizza/
├─ .claude/              правила, доки (docs/ — поза git)
├─ backend/              NestJS API
├─ frontend/             пізніше
├─ docker-compose.yml    Postgres + Mailpit для розробки
├─ package.json          список воркспейсів
└─ bun.lock              єдиний lock-файл
```

- Пакетний менеджер — **тільки Bun**. Жодних `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`.
- **Один `bun.lock` у корені.** Lock-файлів у підпапках бути не повинно; якщо з’явився — це помилка, видаляємо й робимо `bun install` з кореня.
- Пакети ставимо **з кореня з `--filter`**: `bun add <пакет> --filter backend` (dev-залежність — ще `-d`). Пакет записується в `package.json` свого воркспейсу, lock оновлюється в корені.
- **Без `--filter` — тільки спільні інструменти репо** (наприклад, Prettier). Залежності застосунків у кореневий `package.json` не ставимо.
- Після `git pull` чи зміни залежностей — `bun install` з кореня.
- У CI і Docker — `bun ci` (те саме, що `bun install --frozen-lockfile`): падає, якщо `bun.lock` розходиться з `package.json`. Для продакшен-образу — `bun install --frozen-lockfile --production`. Локально — звичайний `bun install`.
- Новий воркспейс (наприклад, `frontend`) спершу додаємо в `workspaces` кореневого `package.json`, потім ставимо в нього пакети.

## Лінтер і форматер

Один лінтер і один форматер на весь монорепо; пакети й скрипти — у кореневому `package.json`.

- **Oxlint** (type-aware через `oxlint-tsgolint`), ESLint не використовуємо. Спільні правила — `/.oxlintrc.json`; у воркспейсі — свій `.oxlintrc.json`, який підключає кореневий через `extends` і додає лише своє (плагіни, `env`, винятки). `options.typeAware` і `maxWarnings: 0` — тільки в корені.
- **Prettier** — один `/.prettierrc` у корені (імпорти сортує `@ianvs/prettier-plugin-sort-imports`); `.prettierrc` у воркспейсах не заводимо.
- Скрипти з кореня: `bun run lint`, `lint:fix`, `format`, `format:check`; `typecheck`, `test`, `build` запускають однойменні скрипти бекенду.
- Попередження лінтера вважаються помилками: `bun run lint` із ними падає.
- `.vscode/` — у git: рекомендовані розширення (oxc, Prettier), форматування й автовиправлення при збереженні.

## Документи

Робочі доки — у `.claude/docs/` (поза git):
- `SPEC.md` — поведінка продукту: сценарії, валідація, бонуси, стани. Джерело правди для бекенду й фронтенду.
- `design/HANDOFF.md` — дизайн у Figma: структура файлу, токени, карта файлів.
- `tooling/` — інструменти й версії: спершу `common.md`, потім `backend.md` чи `frontend.md`.

## Правила фронтенду і бекенду

Підключаються автоматично на початку кожної сесії:
@frontend/RULES.md
@backend/RULES.md
