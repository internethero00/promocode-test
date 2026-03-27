# Promo Code API

REST API для системы промокодов. Позволяет создавать промокоды с ограниченным количеством активаций, сроком действия и процентом скидки, а также активировать их по email.

## Стек

- **Node.js** + **TypeScript**
- **NestJS** — фреймворк
- **PostgreSQL** — база данных
- **Prisma 6** — ORM
- **Swagger** — документация API
- **Jest** + **Supertest** — e2e тесты
- **Docker** — контейнеризация
- **GitHub Actions** — CI

## Быстрый старт

### Docker (одна команда)

```bash
docker compose up --build
```

Поднимает PostgreSQL, применяет миграции и запускает приложение. API доступен на `http://localhost:3000`, Swagger — на `http://localhost:3000/api/docs`.

### Локальная разработка

```bash
# 1. Поднять базу
docker compose up db -d
 
# 2. Установить зависимости
npm install
 
# 3. Применить миграции
npx prisma migrate dev
 
# 4. Запустить приложение
npm run start:dev
```

## API эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| `POST` | `/promo-codes` | Создать промокод |
| `GET` | `/promo-codes` | Получить список промокодов |
| `GET` | `/promo-codes/:code` | Получить промокод по коду |
| `POST` | `/promo-codes/:code/activate` | Активировать промокод |

### Создание промокода

```bash
curl -X POST http://localhost:3000/promo-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER2026",
    "discountPercent": 15,
    "activationLimit": 100,
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }'
```

### Активация промокода

```bash
curl -X POST http://localhost:3000/promo-codes/SUMMER2026/activate \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Валидация

- `code` — непустая строка
- `discountPercent` — целое число от 1 до 100
- `activationLimit` — целое число от 1
- `expiresAt` — дата в формате ISO 8601, должна быть в будущем
- `email` — валидный email

## Обработка ошибок

| Код | Ситуация |
|-----|----------|
| `400` | Невалидные данные, промокод просрочен, лимит исчерпан |
| `404` | Промокод не найден |
| `409` | Код уже существует, email уже активировал этот промокод |

## Защита от race conditions

Активация промокода выполняется в транзакции с уровнем изоляции `Serializable`. Это гарантирует, что лимит активаций не будет превышен при конкурентных запросах. Дополнительно, составной уникальный индекс `@@unique([promoCodeId, email])` на уровне PostgreSQL исключает повторную активацию одним email.

## Тестирование

```bash
# Запуск e2e тестов (автоматически применяет миграции к тестовой базе)
npm run test:e2e
```

Тесты используют отдельную базу `promo_code_test`, которая создаётся автоматически при первом запуске Docker. Перед каждым тестом таблицы очищаются.

Покрытые сценарии:
- Создание промокода
- Создание с дублирующим кодом → 409
- Невалидные данные (процент > 100, дата в прошлом) → 400
- Получение списка (пустой и непустой)
- Получение по коду / несуществующий код
- Успешная активация
- Повторная активация тем же email → 409
- Превышение лимита активаций → 400
- Активация просроченного промокода → 400
- Невалидный email → 400

## CI

GitHub Actions автоматически запускает при push и PR в `main`:
1. Линтер
2. Сборка проекта
3. E2e тесты на отдельной PostgreSQL базе

## Структура проекта

```
src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/
│   └── validators/
│       └── is-future-date.validator.ts
└── promo-code/
    ├── promo-code.module.ts
    ├── promo-code.controller.ts
    ├── promo-code.service.ts
    └── dto/
        ├── create-promo-code.dto.ts
        └── activate-promo-code.dto.ts
 
prisma/
├── schema.prisma
└── migrations/
 
test/
├── promo-code.e2e-spec.ts
└── jest-e2e.json
 
.github/
└── workflows/
    └── ci.yml
```