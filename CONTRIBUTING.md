# Contributing to Katha

Thanks for your interest in contributing.

## Development Flow

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commits
4. Run checks:
   - `npm run lint`
   - `npm run build`
5. Open a pull request

## Commit Style

Use conventional commit style when possible:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` maintenance
- `refactor:` code structure change

## Pull Request Expectations

- Clear description of what changed and why
- Screenshots/GIFs for UI changes
- Mention any breaking changes
- Keep PRs focused and reasonably small

## Code Quality

- Prefer readability over cleverness
- Keep components modular
- Add concise comments only where needed

## Security

Never commit API keys or secrets.
Use `.env` files locally and `.env.example` for documentation.
