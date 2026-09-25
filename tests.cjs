"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const N = require("./engine.js");
const finding = (a, id) => N.review(a).findings.find(f => f.id === id);

test("unknown answers never pass and retain conditional checks", () => {
  const r = N.review(N.blank());
  assert.equal(r.applicable, 12);
  assert.equal(r.answered, 0);
  assert.equal(r.findings.filter(f => f.status === "PASS").length, 0);
  assert.equal(r.findings.length, 15);
});
test("each control distinguishes declared gap, unknown, and declared presence", () => {
  for (const c of N.controls) for (const [value, expected] of [["no", "WARNING"], ["unknown", "INFO"], ["yes", "PASS"]]) {
    assert.equal(finding({ ...N.blank(), [c.id]: value }, c.id).status, expected);
  }
});
test("read-only removes write approval but never data-release checks", () => {
  const a = { ...N.blank(), power: "read", delegates: "no", egress: "no", approval: "yes", delegation: "yes" };
  assert.equal(N.review(a).applicable, 10);
  assert.equal(finding(a, "approval").status, "INFO");
  assert.equal(finding(a, "delegation").status, "INFO");
  assert.equal(finding(a, "egress").status, "WARNING");
});
test("write and unknown power retain approval; delegation yes/unknown retain checks", () => {
  for (const power of ["unknown", "write", "admin"]) for (const delegates of ["yes", "unknown"]) {
    const a = { ...N.blank(), power, delegates, approval: "no", delegation: "no" };
    assert.equal(finding(a, "approval").status, "WARNING");
    assert.equal(finding(a, "delegation").status, "WARNING");
  }
});
test("administrative exposure survives all affirmative control answers", () => {
  const a = { ...N.example("constrained"), power: "admin" };
  assert.equal(finding(a, "admin").status, "WARNING");
});
test("external influence adds a concrete adversarial test", () => {
  assert.ok(finding({ ...N.blank(), untrusted: "yes" }, "external").action.includes("synthetic"));
  assert.equal(finding({ ...N.blank(), untrusted: "no" }, "external"), undefined);
});
test("malformed, incomplete, extra, inherited, and injected values are rejected", () => {
  for (const a of [null, [], "yes", {}, { ...N.blank(), unexpected: "yes" }, { ...N.blank(), power: "<img src=x onerror=alert(1)>" }, { ...N.blank(), owner: true }, Object.create(N.blank())]) {
    assert.throws(() => N.review(a));
  }
});
test("examples are deterministic and reports include answers, rule version, and caveat", () => {
  const a = N.example("exposed");
  assert.equal(N.review(a).findings.filter(f => f.status === "WARNING").length, 13);
  assert.deepEqual(N.review(a), N.review(a));
  const report = N.report(a);
  assert.ok(report.includes(N.version));
  assert.ok(report.includes("ANSWERS"));
  assert.ok(report.includes("No score, certification, or live verification"));
  assert.equal(N.review(N.example("constrained")).findings.filter(f => f.status === "PASS").length, 10);
  assert.throws(() => N.example("unexpected"));
});
test("every context combination preserves coverage and unique finding IDs", () => {
  for (const power of ["unknown", "read", "write", "admin"]) for (const untrusted of ["unknown", "yes", "no"]) for (const delegates of ["unknown", "yes", "no"]) {
    const a = { ...N.example("constrained"), power, untrusted, delegates };
    const r = N.review(a);
    assert.equal(r.applicable, 12 - Number(power === "read") - Number(delegates === "no"));
    assert.equal(r.answered, r.applicable);
    assert.equal(new Set(r.findings.map(f => f.id)).size, r.findings.length);
  }
});
test("runtime keeps unsafe DOM, network, and storage APIs out of the application", () => {
  for (const file of ["engine.js", "app.js"]) {
    const source = readFileSync(__dirname + "/" + file, "utf8");
    assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|\beval\s*\(|new Function|\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage/);
  }
  const html = readFileSync(__dirname + "/index.html", "utf8");
  assert.ok(html.includes("connect-src 'none'"));
  assert.ok(html.includes("form-action 'none'"));
  assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
});
