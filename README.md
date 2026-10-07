# ModForge — как запустить проект

Этот файл — пошаговая инструкция для первого запуска. Если вы хотите просто
увидеть приложение, используйте **вариант 1 с Docker Compose**. Он сам
запустит базу данных, backend и frontend.

## Что понадобится

Для самого простого запуска:

1. Установите и запустите **Docker Desktop**.
2. Откройте терминал в папке проекта:

```powershell
Set-Location "G:\Proga\New folder\KILEA"
```

Если вы находитесь в VS Code, откройте терминал сочетанием клавиш
<kbd>Ctrl</kbd>+<kbd>`</kbd>. Убедитесь, что текущая папка — корень проекта:
в ней должны быть `docker-compose.yml` и `package.json`.

## Вариант 1. Запустить всё одной командой — рекомендуется

В терминале из папки проекта выполните:

```powershell
docker compose up --build
```

При первом запуске Docker скачает базовые образы и соберёт приложения. Это
может занять несколько минут. Оставьте терминал открытым: в нём будут видны
сообщения о запуске. Backend начнёт запускаться после того, как база данных
станет готова.

Когда сервисы запустятся, откройте в браузере:

| Что открыть | Адрес |
|---|---|
| Сайт | <http://localhost:8080> |
| API | <http://localhost:3000/api> |
| Документация API (Swagger) | <http://localhost:3000/api/docs> |

Чтобы остановить приложения, нажмите <kbd>Ctrl</kbd>+<kbd>C</kbd> в терминале.
Затем, если контейнеры остались запущенными, выполните:

```powershell
docker compose down
```

`docker compose down` останавливает приложения, но **сохраняет данные базы**.
Не запускайте `docker compose down -v`, если не хотите удалить базу данных и
все сохранённые в ней данные.

### Запуск в фоне

Если не хотите оставлять терминал занятым:

```powershell
docker compose up --build -d
```

Проверить состояние контейнеров:

```powershell
docker compose ps
```

Посмотреть сообщения backend:

```powershell
docker compose logs -f backend
```

Остановить работающий в фоне проект:

```powershell
docker compose down
```

### Добавить примеры для каталога

После запуска всего стека откройте **новый** терминал в папке проекта и
выполните:

```powershell
docker compose exec backend npm run seed
```

Команда добавит демонстрационные игры, категории, проекты, версии, отзывы и
учётные записи. Войти можно с такими данными:

| Роль | Email | Пароль |
|---|---|---|
| Администратор | `admin@modforge.local` | `password123` |
| Автор | `author@modforge.local` | `password123` |
| Пользователь | `user@modforge.local` | `password123` |

Это тестовые пароли. Используйте их только на локальном компьютере, не для
публичного сервера.

## Вариант 2. Запускать frontend и backend отдельно

Этот вариант удобен, если вы собираетесь менять код. PostgreSQL всё ещё
запускается в Docker, а frontend и backend — в отдельных терминалах.

Перед первым запуском backend создайте файл настроек в корне проекта:

```powershell
Copy-Item .env.example .env
```

Откройте `.env` и проверьте `DATABASE_URL`: для подключения к PostgreSQL из
шага 1 адрес должен содержать `localhost`, а пользователь, пароль и имя базы
должны совпадать со значениями в `docker-compose.yml`. Задайте свой
`JWT_SECRET`. Если файл `.env` уже есть, не перезаписывайте его этой командой.

### Шаг 1. Запустить только базу

Терминал №1, из папки проекта:

```powershell
docker compose up -d postgres
docker compose ps
```

В выводе `docker compose ps` дождитесь состояния `healthy` у `postgres`.

### Шаг 2. Запустить backend

Терминал №2, из корня проекта:

```powershell
npm install
npm run start:dev
```

`npm run start:dev` запускает NestJS в режиме разработки: после изменения
backend-кода приложение автоматически перезапускается.

### Шаг 3. Запустить frontend

Терминал №3:

```powershell
Set-Location "G:\Proga\New folder\KILEA\frontend"
npm install
npm run dev
```

Откройте адрес, который Vite напечатает в терминале. Обычно это
<http://localhost:5173>. Frontend отправляет запросы `/api` в backend на
`http://localhost:3000`.

### Как остановить локальный запуск

В терминалах с frontend и backend нажмите <kbd>Ctrl</kbd>+<kbd>C</kbd>.
Затем остановите PostgreSQL из корня проекта:

```powershell
docker compose down
```

## Если что-то не запускается

### Команда `docker compose` не работает

Убедитесь, что Docker Desktop установлен и запущен. В Docker Desktop дождитесь,
пока он сообщит, что Docker работает, и повторите команду.

### Порт уже занят

Если Docker сообщает, что порт занят, закройте приложение, которое его
использует, или задайте другой порт перед запуском. Например, для сайта:

```powershell
$env:FRONTEND_PORT = "8081"
docker compose up --build
```

Тогда сайт будет доступен по адресу <http://localhost:8081>. Для возврата к
значению по умолчанию закройте терминал или выполните:

```powershell
Remove-Item Env:FRONTEND_PORT
```

### Сайт открылся, но список проектов пуст

Добавьте демонстрационные данные командой:

```powershell
docker compose exec backend npm run seed
```

### Посмотреть сообщения всех сервисов

```powershell
docker compose logs -f
```

Нажмите <kbd>Ctrl</kbd>+<kbd>C</kbd>, чтобы закончить просмотр логов.

## Команды для разработки

Все команды ниже запускаются в терминале из корневой папки, если отдельно не
указано иное.

### Backend (NestJS)

```powershell
npm install
npm run start:dev
```

Полезные команды backend:

```powershell
npm run build
npm run start:prod
npm run seed
```

Перед `npm run seed` backend должен быть собран командой `npm run build`, а
PostgreSQL должен быть запущен и доступен по `DATABASE_URL`.

### Frontend (React + Vite)

Перейдите в папку frontend:

```powershell
Set-Location "G:\Proga\New folder\KILEA\frontend"
npm install
npm run dev
```

Собрать frontend для production:

```powershell
npm run build
```

## База данных: сиды и миграции

Проект использует **TypeORM**. Prisma в этом проекте не используется.

### Сидирование — заполнение тестовыми данными

Сидирование уже настроено. Чтобы выполнить его внутри Docker:

```powershell
docker compose exec backend npm run seed
```

При локальном запуске backend из корня проекта:

```powershell
npm run build
npm run seed
```

Сидер можно запускать повторно: он обновляет фиксированные тестовые записи и
не должен создавать их копии.

### Миграции TypeORM

**Важно:** в проекте пока нет готовых файлов миграций. Для первого знакомства
с приложением миграции запускать не нужно: в локальном Docker Compose включена
автоматическая синхронизация схемы TypeORM.

Миграции нужны, когда вы меняете структуру базы и хотите сохранять эти
изменения в виде файлов. Сначала потребуется подготовить пустую базу,
настроить `DATABASE_URL`, отключить `DB_SYNCHRONIZE`, сгенерировать миграцию и
проверить её SQL перед применением. Не генерируйте начальную миграцию поверх
базы, которую уже создал `DB_SYNCHRONIZE=true`: TypeORM может обнаружить, что
схема уже существует, и не сформировать ожидаемую начальную миграцию.

Команды TypeORM (для подготовленной базы и настроенного окружения):

```powershell
# Создать файл миграции по разнице между сущностями и схемой базы
npm run migration:generate -- src/database/migrations/InitialSchema

# Создать пустой файл миграции для ручного заполнения
npm run migration:create -- src/database/migrations/DescribeChange

# Применить ожидающие миграции
npm run migration:run

# Посмотреть состояние миграций
npm run migration:show

# Отменить последнюю применённую миграцию
npm run migration:revert
```

Не запускайте `migration:revert`, если не понимаете, что именно отменяет
миграция. Перед любыми действиями с важной базой сделайте резервную копию.

## Что читать в проекте

Если хотите понять, как устроено приложение, открывайте файлы в таком
порядке:

1. `docker-compose.yml` — какие программы запускаются вместе.
2. `src/main.ts` — точка запуска backend, API-префикс и Swagger.
3. `src/app.module.ts` — список NestJS-модулей приложения.
4. `src/database/database.module.ts` — подключение TypeORM к PostgreSQL.
5. `src/projects/projects.controller.ts` — HTTP-маршруты проектов.
6. `src/projects/projects.service.ts` — логика поиска и управления проектами.
7. `frontend/src/App.jsx` — страницы и маршруты React-приложения.
8. `frontend/src/api/client.js` — настройка запросов frontend к API.
9. [REPORT.md](./REPORT.md) — пояснительная записка с архитектурой,
   диаграммой связей и таблицей API.
10. [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) — этапы разработки.

## Postman: проверить API

В проекте есть готовый файл коллекции:
[ModForge-Use-Cases.postman_collection.json](./postman/ModForge-Use-Cases.postman_collection.json).

1. Запустите весь проект по варианту 1.
2. Выполните сидирование.
3. Импортируйте JSON-файл в приложение Postman.
4. Запустите запросы коллекции по порядку.

Коллекция проверяет регистрацию и вход, права ролей, создание проекта и
версии, поиск проекта и запрет повторного отзыва.

## Короткий словарь

- **Frontend** — сайт, который открывается в браузере.
- **Backend** — сервер, который проверяет запросы и выполняет бизнес-логику.
- **PostgreSQL** — база данных, в которой хранятся пользователи и проекты.
- **API** — способ, которым frontend отправляет запросы backend.
- **Docker Compose** — инструмент для запуска базы, backend и frontend
  командами Docker.
- **Сид / seed** — тестовые данные для проверки приложения.
- **Миграция** — файл с изменением структуры базы данных.
