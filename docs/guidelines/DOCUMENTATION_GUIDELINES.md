# Documentation Guidelines

1. **Single-purpose topics** – each doc covers one subject (architecture, modules, UX, operations, etc.). If a fact fits elsewhere, link to the existing doc instead of repeating it.
2. **Current + future focus** – describe the system as it works today and any planned improvements. Remove historical context unless it directly informs an upcoming change.
3. **One-point sections** – each heading has a single actionable paragraph or bulleted list; avoid nested subsections unless the parent would otherwise mix topics.
4. **Folder structure** – place design/architecture write-ups under `docs/architecture/`, module explainers under `docs/modules/`, UX and design language under `docs/ux/`, and deploy/runbook material under `docs/operations/`.
5. **Cross-link sparingly** – link once to a destination doc using relative paths; repeated links add noise.
6. **Update cadence** – when code or processes change, update the relevant doc in the same PR and note the adjustment in `implementation_plan.md` if it affects roadmap items.
