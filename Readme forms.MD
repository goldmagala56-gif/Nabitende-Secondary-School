# Getting the forms to actually send email

Both forms (Contact page + Admission Inquiry on the Admissions page) are wired
to use **Formspree** (https://formspree.io) — a free service that takes a form
submission and emails it to you, with no backend server needed.

Until you complete the steps below, both forms will show a message telling
the visitor the form isn't set up yet (instead of silently failing).

## Steps

1. Go to https://formspree.io and sign up for a free account.
2. Create a new form called something like "Nabitende — Contact".
3. Formspree gives you a form endpoint that looks like:
   `https://formspree.io/f/abcd1234`
4. Open `contact.html`, find this line near the contact form:
   ```
   action="https://formspree.io/f/YOUR_CONTACT_FORM_ID"
   ```
   Replace `YOUR_CONTACT_FORM_ID` with your real ID (e.g. `abcd1234`).
5. Repeat steps 2–4 for the admission inquiry form — create a **second**
   Formspree form (e.g. "Nabitende — Admissions"), so contact messages and
   admission inquiries land in separate places. Update the matching line in
   `admissions.html`:
   ```
   action="https://formspree.io/f/YOUR_ADMISSIONS_FORM_ID"
   ```
6. Repeat once more for the newsletter signup — create a **third** Formspree
   form (e.g. "Nabitende — Newsletter"). It appears in the footer of every
   page. Update the matching line (same text on all 14 pages):
   ```
   action="https://formspree.io/f/YOUR_NEWSLETTER_FORM_ID"
   ```
   Note: Formspree is built for one-off form submissions, not bulk email
   sending — it's fine for collecting signups, but you'll want a proper
   mailing list tool (e.g. Mailchimp) to actually email your subscribers.
7. Formspree will send a confirmation email the first time each form is
   submitted (from a real test submission) — you need to click "Confirm" in
   that email before the form goes live.

## Free plan limits to know about

- 50 submissions/month per form on the free plan.
- File uploads (used by the admission form's report card field) may require
  a paid Formspree plan — check their current pricing before relying on it,
  or remove the file upload field if you'd rather stay on free.

## The `/downloads/` folder

The Downloads & Resources page (`downloads.html`) links to files like
`downloads/admission-application-form.pdf`. Create a `downloads/` folder next
to the HTML files and add the real PDFs there, matching the filenames already
linked on the page (or update the links to match your filenames).

## The Google Map on the Contact page

The map currently points to a text search for "Nabitende, Iganga District,
Uganda" — it works, but it's only as accurate as Google's guess for that
search term. For a pin on the exact school compound: find the school on
Google Maps, click "Share" → "Embed a map", copy the `src` URL Google gives
you, and swap it into the `<iframe src="...">` on `contact.html`.