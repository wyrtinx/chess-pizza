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

## Документи

Робочі доки — у `.claude/docs/` (поза git):
- `SPEC.md` — поведінка продукту: сценарії, валідація, бонуси, стани. Джерело правди для бекенду й фронтенду.
- `design/HANDOFF.md` — дизайн у Figma: структура файлу, токени, карта файлів.
- `tooling/` — інструменти й версії: спершу `common.md`, потім `backend.md` чи `frontend.md`.

## Правила фронтенду і бекенду

Підключаються автоматично на початку кожної сесії:
@frontend/RULES.md
@backend/RULES.md
