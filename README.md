# Aurelia

An original alchemy-themed deckbuilding card game built with React, TypeScript, and Vite.

## Development

```bash
npm install
npm run dev
```

## Architecture

```
src/
  engine/       Game session and phase management
  cards/        Card types and data
  recipes/      Recipe discovery interfaces
  inventory/    Resource and card collection interfaces
  journal/      Alchemy journal interfaces
  animation/    Framer Motion presets
  audio/        Audio service interfaces
  networking/   Future multiplayer interfaces
  stores/       Zustand state
  ui/           React components and screens
```
