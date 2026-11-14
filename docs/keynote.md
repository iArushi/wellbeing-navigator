---
marp: true
theme: default
paginate: true
title: "From “I'm not sure what I need” to a well-fitting counsellor"
description: "A product management case study: the Wellbeing Navigator"
style: |
  section { font-family: "Segoe UI", Arial, sans-serif; padding: 56px; }
  h1 { color: #1f4e5f; }
  h2 { color: #1f4e5f; }
  strong { color: #b5483a; }
  table { font-size: 0.7em; }
  blockquote { border-left: 6px solid #1f4e5f; color: #444; }
  footer { font-size: 0.6em; color: #777; }
footer: "Wellbeing Navigator · PM case study · prototype, not clinical advice"
---

<!-- _class: lead -->
<!-- _paginate: false -->

# From “I'm not sure what I need”
# to a well-fitting counsellor

**A product management case study**
Wellbeing Navigator prototype

<!--
Opening (30s): This is a case study in building a product for a sensitive domain. It is a prototype: no real users, no real provider data. I'll be clear about what is evidence and what is hypothesis.
-->

---

## The problem

> People who are struggling often don't know **which kind of support** to try, and those open to counselling face an **overwhelming, high-stakes choice**.

- Menus of benefits fail stressed people
- A bad first session can put someone off for a long time
- The first step is the hardest one

<!--
Keep this human. The framing: the barrier is not lack of services, it is knowing where to start and fearing the wrong choice. Everything in the product hangs off this problem statement.
-->

---

## Who we're building for (hypotheses)

| Persona | Needs |
| --- | --- |
| **Meera**: early career, stressed for weeks, unsure | Privacy, low effort, no pressure |
| **Arjun**: long-standing stress, sceptical | Practical, structured approach |
| **Kavya**: more open in her home language | Language fit as non-negotiable |
| **The reluctant user** | “Not right now” respected |

*Evidence level: assumption. First step is interviews.*

<!--
Flag the evidence level. Personas without research are hypotheses, and saying so is a strength, not a weakness.
-->

---

## Jobs to be done

1. **Make sense of it**: put into words what I feel, safely
2. **Choose without pressure**: a suggestion I can decline
3. **Find someone I can talk to**: a shortlist that fits me
4. **Trust the process**: know how my words are used

> Hired when it feels **private, short, non-judgemental**.
> Fired when it feels like a clinical form.

<!--
JTBD shifts the question from "what features" to "what progress is the person trying to make". The hire and fire criteria become design constraints.
-->

---

## Opportunity solution tree

```
Outcome: more first sessions that feel like a good fit
├─ Unsure what support to try      → Guided check-in
├─ Overwhelmed by provider choice  → Filters + ranked shortlist
├─ Fear of a bad first session     → Explainable match reasons
│                                    → Post-session feedback loop
└─ Privacy and trust concerns      → No text logging; AI for wording only
```

<!--
One outcome at the root, several opportunities, then solutions. It stops us jumping to "build a matching algorithm" before we know which opportunity matters most.
-->

---

## The solution: four stages

**1. Check-in** → **2. Conversation** → **3. Recommendation** → **4. Matching**

- Free-text note, private, not logged
- Up to 4 gentle questions; skips ones already answered
- Four options: self-help, self-check, programme, counselling
- Matching **only** when counselling is recommended

<!--
Walk the journey. Point out that matching is gated: people steered to other support are not pushed into a therapist list.
-->

---

## Design principle: rules decide, AI explains

| | |
| --- | --- |
| **Rules** | Choose the recommendation and the ranking |
| **AI** | Optional wording of the summary only |
| **Fallback** | Plain summary if AI is unavailable |

Why: **auditability, predictability, trust** in a sensitive domain.

<!--
This is the central product decision. An LLM that picks the "match" is hard to review, test or defend. Rules can be reviewed by clinicians. AI adds warmth, not authority.
-->

---

## How matching works

**Step 1: Hard filters** (must be true)
Language · Session mode · Availability

**Step 2: Weighted score** (how well it fits)

| Concern fit | Experience | Style fit | Availability |
| --- | --- | --- | --- |
| **40%** | **25%** | **20%** | **15%** |

**Step 3: Explain** every match, including what did *not* contribute

<!--
Hard filters first because a profile that cannot speak your language is not a lower match, it is not a match. The weights are assumptions, and we say so.
-->

---

## Honest by design

- “A good place to start”, **not** “the perfect match”
- Neutral concern fit when the signal is weak
- Experience weight flagged as an **assumption**
- Synthetic feedback demo kept **separate** from scoring
- Not clinical, on every screen that matters

> *Don't manufacture confidence you don't have.*

<!--
Each of these is a product decision about restraint. This is the slide to dwell on in an interview: knowing what not to claim.
-->

---

## Measuring success

**North Star:** share of matched users whose first session leaves them **feeling understood**

| Inputs | Guardrails |
| --- | --- |
| Check-in completion | Crisis handling |
| Preference completion | Privacy complaints |
| Match to booking intent | Fairness across language groups |
| Willing to continue | “Explanation felt wrong” reports |

<!--
The North Star combines access and quality. Self-reported "felt understood" is a proxy, not a clinical outcome, and I'd say that out loud. Guardrails mean we never trade safety or trust for conversion.
-->

---

## Prioritisation: RICE (illustrative)

| Initiative | RICE |
| --- | --- |
| Safety triage and crisis path | **1,200** |
| Real provider data | 180 |
| Extra preference filters | 150 |
| Feedback loop into ranking | 100 |
| Booking integration | 96 |
| Content library | 87.5 |

**Safety ranks first, but it's a gate, not a score.**

<!--
Numbers are illustrative. The teaching point: frameworks need judgement. RICE shouldn't make safety "optional if the score is low".
-->

---

## Roadmap: Now · Next · Later

| Now | Next | Later |
| --- | --- | --- |
| Safety triage | Real provider data | Feedback loop into ranking |
| Usability tests | Booking | Fairness audits |
| Clinical review | Consented analytics | Learned ranker vs rules |

<!--
Organised by certainty, not dates. Real data comes before the feedback loop, because there is nothing real to learn from until providers are real.
-->

---

## Risks and pre-mortem

*It's a year after launch and it failed. Why?*

1. People didn't trust it with something personal
2. The shortlist felt generic
3. A user in distress was handled badly
4. Employers made it feel like monitoring

→ Each maps to a design choice already made, or a “Now” item.

<!--
A pre-mortem converts vague worry into concrete roadmap items. Mention the responsible AI checklist in docs/frameworks.md.
-->

---

## First experiments

| | Hypothesis | Method |
| --- | --- | --- |
| E1 | A short check-in feels safer than a directory | Usability test, 6 to 8 people |
| E2 | Showing reasons raises willingness to book | A/B: with vs without |
| E4 | The 25% experience weight helps fit | Compare variants on felt-understood |

Start cheap: **does this reduce the barrier at all?**

<!--
Start with E1 and E2. If they fail, nothing else matters.
-->

---

## What I learned

1. **Restraint is a feature** in sensitive domains
2. **Explainability is a requirement**, not a nice-to-have
3. **Label assumptions loudly**: then they become experiments
4. **Frameworks need judgement**: RICE ranked safety first, but safety is a gate
5. **Prototype data teaches process, not truth**

<!--
Close on the learnings. Offer the repo for questions.
-->

---

<!-- _class: lead -->

# Thank you

Code, case study and frameworks toolkit
**github.com/iArushi/wellbeing-navigator**

*Prototype only. Not a clinical tool.*

<!--
Q&A prompts: Why not let the LLM pick the match? How would you validate the weights? How do you handle someone in crisis? What would you cut first?
-->
