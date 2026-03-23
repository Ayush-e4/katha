# Release Checklist

Use this checklist before each public release.

## Product

- [ ] Core flow works end-to-end (upload -> generate -> read).
- [ ] Translation works for supported languages.
- [ ] TTS playback and audio download work.
- [ ] PDF export generates valid files.
- [ ] Mobile and desktop UI sanity checked.

## Engineering

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] API keys are not hardcoded and no secrets are committed.
- [ ] Error states show user-friendly messages.
- [ ] Any migration/env changes are documented.

## Documentation

- [ ] `README.md` reflects latest features.
- [ ] `CHANGELOG.md` has a new version entry.
- [ ] Screenshots in `docs/assets/` are current.
- [ ] `docs/backend.env.example` includes required variables.

## Release Ops

- [ ] Version tag created (`vX.Y.Z`).
- [ ] GitHub release notes published.
- [ ] Post-release smoke test on the deployed build.

