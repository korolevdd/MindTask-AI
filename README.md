# MindTask AI

Интеллектуальная система управления задачами с AI-ассистентом, интеллект-картой и канбан-доской.

## Функционал
- **Mindmap**: Визуализация задач в виде древовидной структуры (React Flow).
- **Kanban**: Управление статусами задач перетаскиванием (dnd-kit).
- **AI Assistant**: Автоматическая декомпозиция задач, семантическая маршрутизация и планирование.
- **Local-First**: Использование SQLite и локального хранения настроек.
- **Интеграция**: Базовая архитектура для MCP (Model Context Protocol) и кастомных навыков.

## Установка и запуск
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Сгенерируйте клиент базы данных:
   ```bash
   npx prisma generate
   ```
3. Настройте базу данных (создаст файл dev.db):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Запустите в режиме разработки:
   ```bash
   npm run dev
   ```

*Примечание:* Если на Windows возникает ошибка `PrismaClientConstructorValidationError`, я изменил тип движка на `binary` в `prisma/schema.prisma`. 
**Важно:** После этого изменения обязательно запустите:
```bash
npx prisma generate
```
Если ошибка сохраняется, попробуйте установить переменную окружения перед запуском:
- PowerShell: `$env:PRISMA_CLIENT_ENGINE_TYPE="binary"; npm run dev`
- CMD: `set PRISMA_CLIENT_ENGINE_TYPE=binary && npm run dev`

## Технологический стек
- React + Vite
- Express (Backend)
- Prisma + SQLite (Persistence)
- Google Gemini API (AI)
- Tailwind CSS + shadcn/ui (UI)
