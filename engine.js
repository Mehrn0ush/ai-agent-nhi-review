/* Original Silastron review rules. No standard or compliance score is implied. */
(function (root) {
  "use strict";
  const version = "1.0.0";
  const choices = [["unknown", "Not known / not verified"], ["yes", "Yes"], ["no", "No"]];
  const context = [
    { id: "power", label: "Maximum reachable capability", help: "Include every tool and downstream identity, not just the intended task.", options: [["unknown", "Not known"], ["read", "Read only"], ["write", "Write / send / execute"], ["admin", "Administer / grant access"]] },
    { id: "untrusted", label: "Can external content influence decisions?", help: "Include tickets, documents, messages, tool responses, and other agents.", options: choices },
    { id: "delegates", label: "Does authority cross a delegation boundary?", help: "Yes for acting on behalf of a user or handing tasks to another agent.", options: choices }
  ];
  const controls = [
    { id: "owner", group: "Identity & lifecycle", label: "Accountable owner and offboarding process?", help: "An owner can inventory and retire the identities, grants, and credentials.", test: "Retire a test agent; verify its grants and credential issuance are removed." },
    { id: "isolated", group: "Identity & lifecycle", label: "Identities separated by workload and environment?", help: "Avoid a shared account spanning unrelated agents or development and production.", test: "Attempt production access using a development workload identity; expect denial." },
    { id: "temporary", group: "Identity & lifecycle", label: "Short-lived, narrowly trusted credentials?", help: "Use workload federation where supported; constrain who can obtain credentials. A short access-token lifetime alone is insufficient if a broad refresh credential persists.", test: "Inspect issuance trust and renewal rights; test an expired credential and an untrusted workload." },
    { id: "scoped", group: "Authority & execution", label: "Permissions limited to required actions and resources?", help: "Include tenant, object, and tool restrictions; read-only access can still disclose data.", test: "Try a neighboring tenant or unrelated object with the same credential; expect denial." },
    { id: "authorization", group: "Authority & execution", label: "Every tool call authorized outside the model?", help: "Trusted application or resource-server code must enforce policy, including tool arguments.", test: "Submit a forbidden tool call directly to the executor; verify it is denied without model involvement." },
    { id: "secrets", group: "Authority & execution", label: "Credentials kept out of model-visible context?", help: "The executor supplies credentials without exposing them in prompts, tool results, or model-readable files.", test: "Use synthetic canary secrets; inspect model inputs, tool outputs, traces, and accessible files for leakage." },
    { id: "approval", group: "Authority & execution", label: "High-impact actions require bound approval?", help: "For write/admin or unknown capability: approval covers the exact action, target, and parameters; the executor checks expiry and replay. Low-impact writes may use a documented policy.", test: "Change the destination after approval and replay an approved action; both must be rejected." },
    { id: "egress", group: "Containment & evidence", label: "Destinations and data release constrained?", help: "Check network tools, external messages, model-provider access, and what the final answer can reveal.", test: "Try an unapproved destination and an unauthorized sensitive-data response; verify both are blocked." },
    { id: "delegation", group: "Containment & evidence", label: "Delegated authority bounded and attributable?", help: "For user delegation or subagents: preserve the initiating subject and acting workload; prevent broader downstream authority.", test: "Request wider authority in a child task; expect denial and a trace linking subject, actor, and task." },
    { id: "audit", group: "Containment & evidence", label: "Actions linked to identity, task, and policy decision?", help: "Record tool, target, outcome, and approval reference where applicable; redact secrets and unnecessary personal data.", test: "Reconstruct a synthetic action from subject or scheduler through executor to resource outcome." },
    { id: "stop", group: "Containment & evidence", label: "Containment tested for active and queued work?", help: "Stop execution and renewal; determine what issued credentials can still do. Stopping a process need not invalidate its tokens.", test: "Trigger containment with queued work and an issued token; record residual access and time to denial." },
    { id: "budget", group: "Containment & evidence", label: "Tool calls, retries, and child tasks bounded?", help: "Enforce runtime limits outside the model, including cost and time limits appropriate to the task.", test: "Force repeated failures and recursive delegation; verify configured limits terminate execution." }
  ];
  const fields = [...context, ...controls.map(c => ({ ...c, options: choices }))];
  const blank = () => Object.fromEntries(fields.map(f => [f.id, "unknown"]));
  function validate(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Expected an answer object.");
    if (Object.keys(input).length !== fields.length) throw new Error("Unexpected or missing answer fields. Reset the form.");
    for (const f of fields) {
      if (!Object.hasOwn(input, f.id) || !f.options.some(o => o[0] === input[f.id])) {
        throw new Error("Choose a supported answer for: " + f.label);
      }
    }
  }
  function applicable(c, a) {
    return !(c.id === "approval" && a.power === "read") && !(c.id === "delegation" && a.delegates === "no");
  }
  function review(a) {
    validate(a);
    const findings = controls.map(c => {
      const active = applicable(c, a);
      const status = !active || a[c.id] === "unknown" ? "INFO" : a[c.id] === "yes" ? "PASS" : "WARNING";
      const reason = !active ? "Not assessed for the declared context; this is not a pass."
        : a[c.id] === "yes" ? "Control declared present; implementation has not been verified."
        : a[c.id] === "no" ? "Control gap declared. Address it or document a justified compensating control."
        : "Evidence missing. Confirm this control before relying on it.";
      return { id: c.id, status, title: c.label, reason, action: active ? c.test : "Revisit if the reachable capability or delegation changes." };
    });
    if (a.power === "admin") findings.push({ id: "admin", status: "WARNING", title: "Administrative authority is reachable", reason: "Other controls do not remove the consequences of privilege-changing actions.", action: "Separate administration from routine tasks and test a narrow, independently approved execution path." });
    for (const f of context) {
      if (a[f.id] === "unknown") findings.push({ id: "context-" + f.id, status: "INFO", title: f.label, reason: "Context is unknown; applicable review checks remain conservative.", action: "Inventory the full execution path and confirm this answer." });
    }
    if (a.untrusted === "yes") findings.push({ id: "external", status: "INFO", title: "External content can steer tool use", reason: "Valid credentials do not establish that an action matches the intended task.", action: "Place conflicting instructions in a synthetic ticket or tool response; verify that forbidden actions remain denied." });
    const rank = { WARNING: 0, INFO: 1, PASS: 2 };
    findings.sort((a, b) => rank[a.status] - rank[b.status]);
    const active = controls.filter(c => applicable(c, a));
    return { version, findings, answered: active.filter(c => a[c.id] !== "unknown").length, applicable: active.length };
  }
  function report(a) {
    const r = review(a);
    return ["AI Agent NHI Review Planner — rules " + version,
      "Self-reported design review. No score, certification, or live verification.",
      `${r.answered}/${r.applicable} applicable controls answered; counts are not a risk score.`,
      "", "ANSWERS", ...fields.map(f => f.label + " " + f.options.find(o => o[0] === a[f.id])[1]),
      "", "FINDINGS", ...r.findings.map(f => `[${f.status}] ${f.id}: ${f.title}\n${f.reason}\nVerify / next step: ${f.action}`),
      "", "Review exported information before sharing. Reassess after tool, identity, or policy changes."
    ].join("\n");
  }
  function example(kind) {
    if (!["exposed", "constrained"].includes(kind)) throw new Error("Unknown example.");
    const a = blank();
    for (const c of controls) a[c.id] = kind === "exposed" ? "no" : "yes";
    return { ...a, power: kind === "exposed" ? "admin" : "read", untrusted: "yes", delegates: kind === "exposed" ? "yes" : "no" };
  }
  const api = { version, fields, controls, blank, validate, review, report, example };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NHI = api;
})(globalThis);
