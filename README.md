# AI Agent NHI Review Planner

A local-only design-review tool that turns an AI agent's identity and authority model into control gaps and concrete verification steps.

## Why this exists

Inventorying a service account does not explain how an agent can use it. Engineers also need to review tool permissions, delegated authority, approvals, data release, and containment along an execution path.

## Features

- Three context questions and 12 control checks.
- Explicit unknown answers and context-dependent applicability.
- WARNING, INFO, and self-reported PASS findings; ERROR for invalid inputs.
- Stable rule IDs and actionable verification steps.
- Exposed and constrained examples, reset, light/dark themes.
- Copy a plain-text report, manual-copy fallback, and local `.txt` download.
- Responsive, keyboard-operable interface without runtime dependencies.

## Demo

Intended URL after deployment: [https://mehrn0ush.github.io/ai-agent-nhi-review/](https://mehrn0ush.github.io/ai-agent-nhi-review/)

This repository does not imply that the demo or companion article is already published.

## Privacy

Your data is processed locally in your browser and is not sent to Silastron or any third party. No analytics, external scripts, network API calls, URL-encoded answers, cookies, or application storage are used. Hosting receives normal page requests. Outbound links navigate only when clicked and use a no-referrer policy.

Answers remain in page memory. Reset removes the current answers and report, but cannot erase clipboard copies or downloads. Exports happen only on request. Browser extensions and browser-managed restoration are outside the application's control. Do not enter credentials; the tool only accepts predefined choices.

## Usage

1. Review one agent execution path, including downstream tools and identities.
2. Set maximum capability, external influence, and delegation context.
3. Answer Yes only if every part of a control exists; retain unknowns otherwise.
4. Generate the review. Take warning and evidence requests into a design review.
5. Run the suggested tests in an authorized test environment.
6. Copy or download the report if needed; inspect it before sharing.

Editing an answer invalidates the previous report and disables export until regeneration.

## Methodology and limitations

Rules version: **1.0.0**. This is a practitioner-authored checklist, not an OWASP assessment, compliance framework, risk score, or security certification.

- An applicable control answered No produces WARNING; unknown produces INFO; Yes produces PASS, meaning declared present only.
- Read-only context skips the write-approval check. No delegation skips the delegation check. Skipped checks produce INFO, never PASS. Unknown context retains both checks.
- Administrative capability always adds WARNING. External influence adds an adversarial test. Unknown context requests inventory evidence.
- Coverage counts include only applicable controls; counts are not probabilities or risk scores.

Control IDs: `owner`, `isolated`, `temporary`, `scoped`, `authorization`, `secrets`, `approval`, `egress`, `delegation`, `audit`, `stop`, `budget`. Questions and verification steps are defined in `engine.js`.

No IAM policies, accounts, tokens, actual permissions, or model behavior are inspected. Answers may be incomplete or wrong. Read-only access can disclose information. Tool composition, memory poisoning, supply-chain compromise, and provider-specific behavior require additional review. Evaluate materially different execution paths separately. No fixed credential lifetime is universally safe.

Design references: [OWASP NHI Top 10](https://owasp.org/www-project-non-human-identities-top-10/), [OWASP Excessive Agency, 2025](https://owasp.github.io/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html), [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html), and [AWS IAM guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html). These inform the review, not a normative one-to-one mapping.

## Technical details

HTML5, CSS, and vanilla JavaScript; no build, package installation, backend, database, or API keys. `engine.js` contains deterministic validation and review rules shared by the browser and Node tests. `app.js` uses DOM creation and `textContent`, never HTML interpolation. Inputs are allowlisted enums. CSP blocks connections and form submissions; no third-party assets load. Reports use plain text and local Blob downloads.

The meta CSP cannot provide every HTTP-header protection, including `frame-ancestors`. It is defense in depth, not protection against modified hosting or malicious extensions. Clipboard access may require HTTPS/localhost and permission; manual copy remains available.

## Running locally

Open `index.html` directly, or from this directory run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit http://127.0.0.1:8000. Python is optional; any static server works. Run regression tests with Node.js 22 or newer:

```sh
node --test tests.cjs
```

## GitHub Pages deployment

1. Create the public repository `silastron/ai-agent-nhi-review` without generated starter files.
2. Add all repository files, including the empty `.nojekyll`, to its root.
3. Commit and push to `main`.
4. In Settings → Pages, select **Deploy from a branch**.
5. Select **main** and **/(root)**, then Save.
6. Wait for the Pages deployment to complete; verify the demo URL and both examples.

No custom Actions workflow is needed. GitHub handles branch-based deployment. If you fork or rename the repository, update canonical/OG URLs, demo, and GitHub links. Before launch, publish the companion article at `https://silastron.com/what-is-nhi-ai-agents/` or update the article link in `index.html` to its final permalink.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities privately through GitHub Security Advisories when enabled. Do not put secrets or sensitive reports in public issues. Maintainers should enable private vulnerability reporting before publication.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Propose focused changes with evidence, tests for rule behavior, and keyboard/mobile checks. Preserve local-only processing.

## License

MIT. See [LICENSE](LICENSE). External references retain their respective licenses.
