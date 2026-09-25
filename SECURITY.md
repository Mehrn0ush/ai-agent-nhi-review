# Security policy

The current `main` branch is maintained. No support or response-time guarantee is offered.

## Reporting

Use the repository's Security → Advisories → Report a vulnerability when private reporting is enabled:
https://github.com/silastron/ai-agent-nhi-review/security/advisories/new

If unavailable, use https://silastron.com/contact/ to request a private reporting channel without including exploit details or sensitive data. Never post secrets or confidential review reports in public issues. Include affected commit, reproduction steps using synthetic inputs, expected/actual behavior, and impact through the agreed private channel.

Maintainers: enable GitHub private vulnerability reporting before launch and verify the contact route.

## Scope and boundaries

The app reviews declarations; it does not validate infrastructure or execute suggested tests. Security-relevant defects include input leakage, DOM injection, and misleading review logic. Use an authorized test environment for suggested verification steps.

No input is transmitted, persisted by application code, or encoded into links. Clipboard writes and downloads are user initiated. Reset cannot revoke an export. Hosting, browser extensions, compromised devices, and browser-managed restoration are outside this application's trust boundary.

The CSP blocks network connections and form submissions. Meta CSP cannot enforce `frame-ancestors`; hosts needing anti-framing controls must configure appropriate response headers. Review source and host integrity before relying on any browser tool for sensitive work.
