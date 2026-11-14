# YourDOST Wellbeing Navigator

**Mental health and wellbeing check-in with a structured approach to finding a well-fitting counsellor or psychologist.**

A Next.js prototype that helps employees describe what is on their mind, answer a few gentle follow-up questions, and see a suggested next step. If counselling is suggested, a second stage matches fictional therapist profiles to the person's stated needs and preferences, and explains every match in plain language.

> This is a product navigation aid. It is **not** a clinical assessment, diagnosis, booking service, or substitute for professional care. If you are in crisis or at risk of harm, contact local emergency services or a qualified professional.

## The journey

1. **Check-in**: a private free-text note about what has been going on.
2. **Conversation**: scripted follow-up questions about impact, duration, the kind of support wanted and openness to a counsellor. Duration is skipped if it was already mentioned.
3. **Recommendation**: a deterministic suggestion from a small catalogue (self-help exercise, wellbeing self-check, guided programme, or counselling), with optional AI-written wording.
4. **Matching** (counselling only): collect preferences, filter to eligible profiles, then rank them with an explainable score.

## How the psychologist matching works

The goal is a good fit, not a black-box "perfect match". Matching runs in three steps and every step is inspectable.

### 1. Gate: is matching appropriate?

Matching is only offered when the recommendation engine's primary suggestion is counselling. People who were steered to other support are not pushed into a therapist list.

### 2. Hard filters: what must be true

Profiles are removed if they cannot meet a stated requirement:

| Preference | Options | Rule |
| --- | --- | --- |
| Language | English, Hindi, Tamil, Kannada, No preference | Profile must list the language (skipped for "No preference") |
| Session mode | Video, Audio, Chat | Profile must offer the mode |
| Availability | Weekday mornings, Weekday evenings, Weekends, Flexible | Profile must have that window (skipped for "Flexible") |

### 3. Soft ranking: what fits best

Eligible profiles get a score between 0 and 1 from four weighted factors.

| Factor | Weight | What it measures |
| --- | --- | --- |
| Concern fit | 40% | Overlap between themes in the check-in (for example anxiety, work stress, sleep, relationships) and the profile's listed specialties |
| Track record | 25% | Years of experience, and years in the relevant area |
| Style fit | 20% | Preferred style (structured and goal-focused, listening and reflective, CBT-informed, exploratory). Exact match scores 1, a related style 0.5 |
| Availability fit | 15% | How well listed windows match, or how open the profile is when you are flexible |

Details that keep the ranking honest:

- Concern themes come from the AI interpretation when available, otherwise from keyword detection. If neither is reliable, concern fit is neutral (0.5) and does not include, exclude or prefer anyone.
- Ties are broken deterministically by profile id.
- The top three are shown as featured matches and the rest are listed separately.
- Each match includes a written explanation of why it was suggested and which factors did and did not contribute.
- The weights are illustrative prototype assumptions. In particular, years of experience is **not** a measure of clinical quality or outcomes.

### Concern taxonomy

`academic-stress`, `work-stress`, `anxiety`, `relationships`, `low-motivation`, `sleep`, `adjustment`, `social-disconnection`, `work-life-balance`.

## Product management case study

This repo doubles as a PM portfolio project. The prototype is the artefact, and the docs show the thinking behind it.

| Document | What it covers |
| --- | --- |
| [`docs/case-study.md`](docs/case-study.md) | Problem framing, personas and jobs to be done, opportunity solution tree, decisions and trade-offs, metrics, RICE and roadmap, risks and ethics, experiment plan |
| [`docs/frameworks.md`](docs/frameworks.md) | A toolkit of 22 PM frameworks (JTBD, Kano, RICE, MoSCoW, North Star, HEART, AARRR, pre-mortem, decision records, Responsible AI checklist, PRD and experiment templates), each with a worked example and a template |
| [`docs/keynote.md`](docs/keynote.md) | A 16-slide keynote with speaker notes, written for [Marp](https://marp.app/) (use the Marp extension in VS Code or Cursor, or `npx @marp-team/marp-cli docs/keynote.md --pptx`) |

The case study has no real user research behind it. Personas, metrics and RICE numbers are labelled as hypotheses or illustrations.

## Prototype limitations

- Therapist profiles, availability, scores and sample session feedback are **fictional and unvalidated**.
- No real counsellor data, booking, or helpline numbers are connected.
- Matching scores have not been validated against real outcomes.
- Before real use this would need clinical review, real provider data, bias and fairness testing, and a proper crisis-escalation path.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional interpretation uses OpenRouter. Create a `.env.local` from your own key and never commit it:

```
OPENROUTER_API_KEY=
```

If the interpretation service is unavailable, the recommendation screen still works with a fallback summary.

## Project structure

```
app/                      Next.js routes: check-in, conversation, recommendation, matching, interpretation API
components/               UI for each stage of the journey
lib/conversation/         Scripted follow-up questions and coverage logic
lib/recommendation/       Catalogue and rule-based next-step engine
lib/matching/             Concern tagging, eligibility filters, scoring, fictional profile data
```

Both engines have unit tests (`lib/matching/engine.test.ts`, `lib/recommendation/engine.test.ts`).

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Rule-based recommendation and matching engines
- OpenRouter for optional interpretation text only (it does not choose the service or the match)

## Privacy and safety

- Employee text is not logged.
- No helpline numbers, booking, or live counsellor data.
- Matching does not treat listed experience or scores as clinical quality.
- AI is limited to wording and theme extraction. The recommendation and ranking are deterministic and explainable.
