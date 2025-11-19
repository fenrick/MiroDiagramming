# Post-Backend Cleanup Notes

The repository now ships only the browser-based Miro panel. Keep these checkpoints in mind while evolving the codebase:

- **Global assumptions** – Everything runs inside Miro; remove any lingering references to `/api/`, Fastify, or Prisma when encountered. New features must rely solely on the Web SDK helpers.
- **Docs alignment** – When touching documentation, confirm it only references the frontend stack (`docs/README.md`, `docs/architecture/ARCHITECTURE.md`, etc.). Historical backend context belongs under `docs/archive/`.
- **Future work** – Track refinements (BoardAdapter adoption, stronger typing, UX polish) in `implementation_plan.md`. Close this file once the backlog no longer references backend migration tasks.
