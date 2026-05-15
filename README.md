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
2. Настройте базу данных:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Запустите в режиме разработки:
   ```bash
   npm run dev
   ```

## Технологический стек
- React + Vite
- Express (Backend)
- Prisma + SQLite (Persistence)
- Google Gemini API (AI)
- Tailwind CSS + shadcn/ui (UI)
