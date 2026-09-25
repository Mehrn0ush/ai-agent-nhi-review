# Contributing

Open an issue for a usability problem or a proposed control, without sensitive data. Fork the repository, create a focused branch, and submit a pull request explaining the problem, changed behavior, and validation.

For rule changes, cite primary sources and distinguish protocol requirements from design recommendations. Update rule version, documentation, and regression tests together. Do not invent risk scores or label self-reported controls as verified security.

Run `node --test tests.cjs`. Check both examples, unknown answers, conditional checks, changed-answer invalidation, reset, copy/fallback, and download. Test keyboard navigation, visible focus, light/dark themes, and narrow/mobile layouts. Use synthetic data only.

Preserve the no-build static architecture and local-only processing. Do not add analytics, remote scripts, input-bearing links, or external calls. Keep exports deliberate and output rendering text-safe.

Report vulnerabilities using SECURITY.md, not public issues.
