# Contributing to CollabArt

Thanks for your interest in contributing! This file outlines a simple workflow to keep contributions clear and easy to review.

How to contribute

1. Fork the repository and create a branch with a clear name, e.g. `feature/add-player` or `fix/upload-bug`.
2. Install dependencies and run the dev server locally:

```bash
npm install
npm run dev
```

3. Make your changes in a focused branch. Keep commits small and descriptive.
4. Add tests where applicable and update types if public types change.
5. Open a Pull Request to `master` with a concise description of the change, why it's needed, and any setup steps to test it.

PR checklist

- [ ] The change has a descriptive title and summary.
- [ ] The code builds and the dev server runs without errors.
- [ ] Any added components are documented or have example usage.
- [ ] Linting passes: `npm run lint`.

Code style

- Follow existing TypeScript and React style in the repository.
- Use the design primitives in `components/ui/` when adding UI elements.

If you're planning a large feature, open an issue first so we can discuss design and API choices.

See `CODE_OF_CONDUCT.md` for community expectations.
