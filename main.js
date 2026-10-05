// Mobile menu
document.addEventListener("click", (e) => {
  const b = e.target.closest(".burger");
  if (b) document.querySelector(".menu").classList.toggle("open");
});

// Quick Living Trust Check
const quiz = document.getElementById("quiz");
if (quiz) {
  quiz.addEventListener("change", () => {
    const n = quiz.querySelectorAll("input:checked").length;
    const r = quiz.querySelector(".result");
    r.style.display = n ? "block" : "none";
    r.innerHTML = n >= 3
      ? "<strong>A living trust is very likely right for you.</strong> You checked " + n + " boxes. Let's talk it through on a free call."
      : "<strong>Good reason to schedule a trust review.</strong> Even one of these can mean your family would face probate without a trust.";
  });
}

// Payment intake -> Supabase -> Stripe Checkout
const FN = "https://bshklbmraykqdmbrgtxc.supabase.co/functions/v1/lta-checkout";
const payForm = document.getElementById("pay-form");
if (payForm) {
  const params = new URLSearchParams(location.search);
  payForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = payForm.querySelector(".form-msg");
    const btn = payForm.querySelector("button[type=submit]");
    msg.textContent = "";
    if (!payForm.agree.checked) { msg.textContent = "Please check the box to continue."; return; }
    btn.disabled = true; btn.textContent = "Opening secure checkout…";
    const data = Object.fromEntries(new FormData(payForm).entries());
    if (params.get("test")) { data.plan = "test"; data.test_code = params.get("test"); }
    try {
      const r = await fetch(FN, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.error || "Something went wrong.");
      if (window.gtag) gtag("event", "begin_checkout", { value: data.plan === "test" ? 1 : 3000, currency: "USD" });
      setTimeout(() => { location.href = j.url; }, 300);
    } catch (err) {
      msg.textContent = err.message + " You can also call (858) 519-2297.";
      btn.disabled = false; btn.textContent = "Continue to Secure Payment";
    }
  });
}

// Free consultation form -> Supabase lta-contact
const cForm = document.getElementById("consult-form");
if (cForm) {
  cForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = cForm.querySelector(".form-msg"), btn = cForm.querySelector("button[type=submit]");
    msg.textContent = "";
    const d = Object.fromEntries(new FormData(cForm).entries());
    d.consent = cForm.consent.checked;
    if (!d.full_name || (!d.phone && !d.email)) { msg.textContent = "Please enter your name and a phone number or email."; return; }
    if (!d.consent) { msg.textContent = "Please check the box so Kristi can contact you."; return; }
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch("https://bshklbmraykqdmbrgtxc.supabase.co/functions/v1/lta-contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) });
      const res = await r.json();
      if (!r.ok) throw new Error(res.error || "Something went wrong.");
      cForm.style.display = "none"; document.getElementById("consult-done").style.display = "block";
      if (window.gtag) { gtag("event", "generate_lead", { form: "free_consultation" }); gtag("event", "qualify_lead", { form: "free_consultation" }); }
    } catch (err) {
      msg.textContent = err.message + " You can also call (858) 519-2297.";
      btn.disabled = false; btn.textContent = "Request My Free Consultation";
    }
  });
}

// California probate cost calculator (Probate Code §10810)
const calc = document.getElementById("calc");
if (calc) {
  const num = (el) => Number(String(el.value).replace(/[^0-9.]/g, "")) || 0;
  const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const fee = (g) => {
    const tiers = [[100000, .04], [100000, .03], [800000, .02], [9000000, .01], [15000000, .005]];
    let left = g, f = 0;
    for (const [amt, r] of tiers) { const x = Math.min(left, amt); f += x * r; left -= x; if (left <= 0) break; }
    return f;
  };
  const run = () => {
    const g = num(document.getElementById("cv_home")) + num(document.getElementById("cv_other"));
    const f = fee(g);
    document.getElementById("co_gross").textContent = fmt(g);
    document.getElementById("co_att").textContent = fmt(f);
    document.getElementById("co_exe").textContent = fmt(f);
    document.getElementById("co_total").textContent = fmt(f * 2);
    document.getElementById("co_note").innerHTML = g <= 208850
      ? "Under California's $208,850 small-estate limit, your family may be able to use a simplified procedure instead of full probate."
      : "Over the $208,850 limit, your family would generally need full probate — typically 12–18 months. A funded living trust avoids it. <a href=\"index.html#consult\">Talk with Kristi</a>.";
  };
  calc.addEventListener("input", (e) => {
    if (e.target.tagName === "INPUT") { const v = num(e.target); e.target.value = v ? v.toLocaleString("en-US") : ""; }
    run();
  });
  run();
}

// Thank-you page: record purchase once per Stripe session
if (location.pathname.endsWith("thank-you.html")) {
  const sid = new URLSearchParams(location.search).get("session");
  try {
    if (sid && window.gtag && !localStorage.getItem("lta_p_" + sid)) {
      gtag("event", "purchase", { transaction_id: sid, currency: "USD", value: 3000 });
      localStorage.setItem("lta_p_" + sid, "1");
    }
  } catch (e) {}
}
