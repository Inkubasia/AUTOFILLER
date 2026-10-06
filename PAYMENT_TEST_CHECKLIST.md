# Payment & Discount — Test Checklist

> **Scope:** Discount calculation fix + amount-reconciliation hardening.
> Mark each step `[x]` as you go. Add notes in the **Notes** column where relevant.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 | Critical / security |
| 🟠 | High — regression or data-integrity risk |
| 🟡 | Medium — edge case |
| 🟢 | Regression — must not break |

---

## TC-1 · Discounted payment on a **resumed** form *(the original bug)* 🔴

> **Before fix:** screen showed $200, Stripe charged $500.

- [ ] Open the form and answer the discount question → **Yes (60%)**
- [ ] Fill remaining fields, hit Save, then close/leave the page (do **not** pay)
- [ ] Re-open the saved form and navigate to the Payment step
- [ ] Confirm the screen displays the **discounted amount (~$200)**
- [ ] Pay with the test card
- [ ] Open Stripe dashboard → find the PaymentIntent → confirm charge = **$200**
- [ ] Screen amount == Stripe charge == email receipt

**Pass:** $200 charged, all three values match.
**Fail (old bug):** Stripe shows $500 while screen showed $200.

---

## TC-2 · Discounted payment in a **single session** *(regression — common path)* 🟠

> **Before fix:** usually worked; this confirms no regression.

- [ ] Start a brand-new form fill (no saved state)
- [ ] Answer discount question → **Yes (60%)**
- [ ] Complete all steps and reach Payment in the **same session**
- [ ] Pay with the test card
- [ ] Stripe dashboard → charge = **$200**

**Pass:** $200 charged.

---

## TC-3 · **Screen = Stripe charge = Receipt** for any discounted form 🔴

- [ ] Note the exact dollar amount shown on the Payment screen
- [ ] Complete payment
- [ ] Compare: Payment screen amount vs. Stripe dashboard vs. emailed receipt
- [ ] All three values are **identical and equal to the discounted amount**

**Pass:** All three match.
**Fail:** Any mismatch between display, charge, and receipt.

---

## TC-4 · Discount **removed** before paying → charged full base 🔴

> **Before fix:** risk of stale $200 charge even after discount was removed.

- [ ] Answer discount question → **Yes (60%)** — payment screen shows ~$200
- [ ] Go **back** and change the discount answer to **No**
- [ ] Return to Payment step
- [ ] Confirm screen now shows **$500** (full base)
- [ ] Pay with the test card
- [ ] Stripe dashboard → charge = **$500**

**Pass:** $500 charged after discount removal.
**Fail:** $200 charged (stale discount).

---

## TC-5 · Multiple discount questions → **MAX discount wins** 🟠

- [ ] Answer **two** discount questions with different percentages (e.g. 20% and 60%)
- [ ] Reach Payment step
- [ ] Confirm screen shows base × **60%** (the maximum)
- [ ] Pay with the test card
- [ ] Stripe dashboard → charge = base × 60%

**Pass:** MAX discount applied.
**Fail:** First/last/sum used instead of MAX.

---

## TC-6 · **Fractional-cents / rounding** stability 🟡

- [ ] Configure base + discount that yields fractional cents (e.g. $99.99 @ 33% = $32.9967)
- [ ] Pay
- [ ] Re-open the payment page / poll a few times after payment
- [ ] Stripe dashboard → intent amount is stable (not flickering/re-written on each load)
- [ ] Charged amount matches the discounted cents (no rounding parity bug)

**Pass:** Amount stable, charge correct.
**Fail:** Intent amount changes on each reload (rounding parity bug).

---

## TC-7 · **Security — Client-side amount tampering is ignored** 🔴

> Covers both network interception and client state manipulation.

### 7a — Network interception
- [ ] On the Payment step of a $500 / 60% form, open DevTools → Network
- [ ] Find the `PUT …/payment-intent/…/amount` request
- [ ] Edit & resend with body `{ amount: 1 }` (attempting to pay $0.01)
- [ ] Complete the payment flow
- [ ] Stripe dashboard → charge = **server-computed $200** (tampered amount ignored)

**Pass:** Server ignores client-supplied amount; charges correct value.
**Fail (old bug):** $0.01 or tampered amount written to Stripe.

### 7b — Client state manipulation
- [ ] In DevTools console, modify `model.payment.discount` to 99% while survey says 10%
- [ ] Proceed to pay
- [ ] Stripe dashboard → charge = survey-derived amount (10% discount), not 99%

**Pass:** Server-side survey computation is authoritative.

---

## TC-8 · **Fail-closed — payment blocked if amount can't be confirmed** 🔴

> **Why it matters:** without this guard, failure would charge the full undiscounted amount.

### 8a — Block the amount PUT in DevTools
- [ ] On Payment step, open DevTools → Network → block `PUT …/amount`
- [ ] Click **Pay**
- [ ] Observe: payment is **aborted** with an error message ("We could not confirm the payment amount. Please try again." or similar)
- [ ] Stripe dashboard → **no charge** for this attempt

### 8b — Server throws (bad Stripe key in dev)
- [ ] Temporarily point the dev environment at an invalid Stripe key
- [ ] Attempt payment
- [ ] Observe: same abort behaviour, no charge

**Pass:** Failure mode is "block and retry," card is never charged.
**Fail:** Payment proceeds and charges full/wrong amount.

---

## TC-9 · **Boundaries** 🟡

### 9a — 100% discount → free, no Stripe charge
- [ ] Answer discount question(s) so total discount = **100%**
- [ ] Reach payment step — confirm no card input is shown (or form submits as free)
- [ ] Submit the form
- [ ] Stripe dashboard → **no PaymentIntent** for this submission

**Pass:** Free submission, nothing in Stripe.

### 9b — Discount results in amount < $0.50 (Stripe minimum)
- [ ] Use base × discount < $0.50 (e.g. $1.00 base @ 90% = $0.10)
- [ ] Payment screen shows **$0.50** (floored to Stripe minimum)
- [ ] Pay; Stripe dashboard → charge = **$0.50**

**Pass:** Floored to $0.50, no error.
**Fail:** Error thrown, or charged $0.00, or charged the sub-minimum amount.

---

## TC-10 · **Hidden discount fields with a previously stored value** 🟡

- [ ] Fill discount fields (e.g. 60%), save progress
- [ ] Reload the form — hide the discount fields (via devtools or conditional logic)
- [ ] Navigate to Payment
- [ ] Observe charge: is it discounted or full base?
- [ ] Document the result — this confirms whether hiding clears the stored value

**Note:** Expected behaviour is TBD; this test maps the actual behaviour.

---

## TC-11 · **Timing / resumed-form race** 🟠

### 11a — Pay before Stripe widget finishes loading
- [ ] Answer discount question
- [ ] Before the Stripe payment widget is fully rendered, attempt to click Pay
- [ ] Confirm charge = discounted amount (or payment is safely blocked until widget is ready)

### 11b — Save → close → reopen → pay immediately
- [ ] Fill discount, save, close tab
- [ ] Reopen saved form, go to Payment step, click Pay immediately (don't wait)
- [ ] Stripe dashboard → charge = **discounted amount**

**Pass:** Correct amount charged regardless of timing.

---

## TC-12 · **Re-entrancy & already-paid** 🟢

### 12a — Double-click Pay
- [ ] On Payment step, double-click or rapidly click Pay multiple times
- [ ] Stripe dashboard → **one charge only** (no duplicates)

### 12b — 3DS card
- [ ] Pay with a 3DS test card (authentication challenge appears)
- [ ] Complete the 3DS challenge
- [ ] Stripe dashboard → charge = **discounted amount**

### 12c — Already-paid form reopened
- [ ] Open a form that has already been paid
- [ ] View / re-submit if the UI allows
- [ ] Stripe dashboard → **no second charge**; mismatch detector does **not** false-alarm

---

## TC-13 · **No discount — full base charge** *(regression)* 🟢

- [ ] Open a gateway form; answer discount question → **No** (or form has no discount)
- [ ] Pay with test card
- [ ] Stripe dashboard → charge = **$500** (full base)

---

## TC-14 · **Pay-later / non-gateway form** *(regression — must be untouched)* 🟢

- [ ] Submit a form whose payment type is **pay-later** (or has no payment at all)
- [ ] Confirm: no Stripe interaction, no errors
- [ ] Form submits normally as before the fix

---

## TC-15 · **Already-paid form** *(regression)* 🟢

- [ ] Open a form with status = already paid
- [ ] View it; attempt re-submit if applicable
- [ ] Confirm: **no re-charge / double-charge**; page loads without errors

---

## Summary Table

| TC | Description | Priority | Pass | Notes |
|----|-------------|----------|------|-------|
| 1 | Resumed form — discounted charge | 🔴 | ☐ | |
| 2 | Single session — discounted charge | 🟠 | ☐ | |
| 3 | Screen = Stripe = Receipt | 🔴 | ☐ | |
| 4 | Discount removed → full base | 🔴 | ☐ | |
| 5 | Multiple discounts → MAX wins | 🟠 | ☐ | |
| 6 | Fractional-cents rounding stability | 🟡 | ☐ | |
| 7a | Network tampering ignored | 🔴 | ☐ | |
| 7b | Client state tampering ignored | 🔴 | ☐ | |
| 8a | Fail-closed: blocked PUT | 🔴 | ☐ | |
| 8b | Fail-closed: server error | 🔴 | ☐ | |
| 9a | 100% discount → free | 🟡 | ☐ | |
| 9b | Sub-$0.50 → floor to $0.50 | 🟡 | ☐ | |
| 10 | Hidden fields with stored value | 🟡 | ☐ | |
| 11a | Race: pay before widget loads | 🟠 | ☐ | |
| 11b | Race: resumed form, pay immediately | 🟠 | ☐ | |
| 12a | Double-click Pay → one charge | 🟢 | ☐ | |
| 12b | 3DS card → correct amount | 🟢 | ☐ | |
| 12c | Already-paid → no second charge | 🟢 | ☐ | |
| 13 | No discount → full base | 🟢 | ☐ | |
| 14 | Pay-later / non-gateway form | 🟢 | ☐ | |
| 15 | Already-paid form view | 🟢 | ☐ | |
