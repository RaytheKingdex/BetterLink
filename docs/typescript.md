# TypeScript Notes

The current mobile client is JavaScript-based. This document reserves guidance for future TypeScript migration.

## Future Migration Targets

- API response/request typing in mobile client
- Navigation parameter typing
- Shared DTO contracts between frontend and backend

## Suggested First Steps

1. Introduce `tsconfig.json` in `frontend/mobile`.
2. Convert API client files first (`src/api/*`).
3. Convert context and navigation modules.

