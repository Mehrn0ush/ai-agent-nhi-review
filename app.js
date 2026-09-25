"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const form = $("review-form");
  let current = null;
  let revision = 0;
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  const groups = new Map();
  for (const f of NHI.fields) {
    const group = f.group || "Execution context";
    if (!groups.has(group)) {
      const fieldset = element("fieldset");
      fieldset.append(element("legend", group));
      groups.set(group, fieldset);
      $("questions").append(fieldset);
    }
    const wrapper = element("div", undefined, "field");
    const label = element("label", f.label);
    label.htmlFor = f.id;
    const help = element("p", f.help, "help");
    help.id = f.id + "-help";
    const select = element("select");
    select.id = f.id;
    select.name = f.id;
    select.setAttribute("aria-describedby", help.id);
    for (const [value, text] of f.options) {
      const option = element("option", text);
      option.value = value;
      select.append(option);
    }
    wrapper.append(label, help, select);
    groups.get(group).append(wrapper);
  }
  function clear(message) {
    revision++;
    current = null;
    $("summary").textContent = message;
    $("findings").replaceChildren(element("p", "Generate a review to see current findings and verification steps.", "empty"));
    $("copy").disabled = $("download").disabled = true;
    $("fallback").hidden = true;
    $("report-text").value = "";
    $("export-status").textContent = "";
    $("error").hidden = true;
    $("error").textContent = "";
  }
  function generate() {
    clear("Preparing review…");
    const answers = Object.fromEntries(NHI.fields.map(f => [f.id, $(f.id).value]));
    try {
      const r = NHI.review(answers);
      const count = status => r.findings.filter(f => f.status === status).length;
      $("summary").textContent = `${r.answered}/${r.applicable} applicable controls answered · ${count("WARNING")} WARNING · ${count("INFO")} INFO · ${count("PASS")} PASS (self-reported). No security verdict.`;
      $("findings").replaceChildren();
      for (const f of r.findings) {
        const card = element("article", undefined, "finding " + f.status.toLowerCase());
        card.append(element("span", f.status + " / " + f.id, "badge"), element("h3", f.title), element("p", f.reason), element("p", "Verify / next step: " + f.action, "next"));
        $("findings").append(card);
      }
      current = NHI.report(answers);
      $("copy").disabled = $("download").disabled = false;
      $("results-heading").focus();
    } catch (error) {
      clear("Review unavailable. Correct the input or reset the form.");
      $("error").hidden = false;
      $("error").textContent = "ERROR: " + error.message;
    }
  }
  form.addEventListener("submit", event => { event.preventDefault(); generate(); });
  form.addEventListener("change", () => clear("Answers changed. Generate a new review before exporting."));
  form.addEventListener("reset", () => clear("Review cleared. All answers return to not known."));
  for (const kind of ["exposed", "constrained"]) $(kind).addEventListener("click", () => {
    const answers = NHI.example(kind);
    for (const f of NHI.fields) $(f.id).value = answers[f.id];
    generate();
  });
  $("copy").addEventListener("click", async () => {
    if (!current) return;
    const snapshot = current;
    const started = revision;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(snapshot);
      if (started === revision) $("export-status").textContent = "Report copied. Review it before sharing.";
    } catch {
      if (started !== revision) return;
      $("fallback").hidden = false;
      $("report-text").value = snapshot;
      $("report-text").focus();
      $("report-text").select();
      $("export-status").textContent = "Clipboard unavailable. Copy the selected report text below.";
    }
  });
  $("download").addEventListener("click", () => {
    if (!current) return;
    let url;
    try {
      url = URL.createObjectURL(new Blob([current], { type: "text/plain;charset=utf-8" }));
      const link = element("a");
      link.href = url;
      link.download = "ai-agent-nhi-review.txt";
      document.body.append(link);
      link.click();
      link.remove();
      $("export-status").textContent = "Download requested. Review the report before sharing.";
    } catch {
      $("export-status").textContent = "Download unavailable. Use Copy report instead.";
    } finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  const theme = $("theme");
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    theme.setAttribute("aria-pressed", String(dark));
  }
  setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  theme.addEventListener("click", () => setTheme(theme.getAttribute("aria-pressed") !== "true"));
  form.reset();
  $("summary").textContent = "No review yet. Describe a path or load an example to get started.";
  $("generate").disabled = false;
})();
