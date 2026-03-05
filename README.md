# Surreal XP Lab Folio

Spatial web experimentation platform.

## Development

**This project strictly enforces `pnpm`.** Do not use `npm` or `yarn`.

### Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Dev Server**
   ```bash
   pnpm dev
   ```

3. **Build Profile**
   ```bash
   pnpm build
   ```

### Quality Gate

Before pushing, ensure the following pass:
```bash
pnpm lint
pnpm typecheck
pnpm build
```

See [docs/quality-gate.md](./docs/quality-gate.md) for more details.
