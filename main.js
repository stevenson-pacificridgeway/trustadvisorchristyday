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
      location.href = j.url;
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
    } catch (err) {
      msg.textContent = err.message + " You can also call (858) 519-2297.";
      btn.disabled = false; btn.textContent = "Request My Free Consultation";
    }
  });
}
