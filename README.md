# YourDOST Wellbeing Navigator

A Next.js prototype that helps employees describe what is on their mind, answer a few gentle follow-up questions, and see a suggested next step. If counselling is suggested, a second stage can match fictional therapist profiles from stated preferences.

This is a product navigation aid. It is not a clinical assessment, diagnosis, booking service, or substitute for professional care.

## Journey

1. **Check-in** — a private note about what has been going on
2. **Conversation** — scripted follow-up questions (duration is skipped if it was already mentioned)
3. **Recommendation** — a deterministic catalogue suggestion, with optional AI wording
4. **Matching** — counselling only; eligibility filters first, then an illustrative rank

Therapist profiles, matching scores, and any session-feedback samples are fictional and unvalidated.

## Run locally

The app lives in this folder.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional interpretation uses OpenRouter. Copy `.env.local` from your own keys only — never commit it:

```
OPENROUTER_API_KEY=
```

If the interpretation service is unavailable, the recommendation screen still works with a fallback summary.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Rule-based recommendation and matching engines
- OpenRouter for optional interpretation text only (it does not choose the service)

## Safety

- No helpline numbers, booking, or live counsellor data
- Employee text is not logged
- Matching does not treat listed experience or scores as clinical quality
