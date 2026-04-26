# DVI Frontend Release Notes

## Current Release Summary

This frontend build now includes the following major areas:

- Repair Orders, Intake, Inspection, QC, Release, and Backjobs
- Customer portal with read-only views and approval actions
- Hybrid AI Assist with local-first fallback behavior
- Customer message composer and AI report builder
- Booking with multi-service selection across staff and customer flows
- Service history, timeline, reports, dashboard, and follow-up tooling
- Technician performance, backjob analytics, supplier analytics, and management dashboards
- Inventory, stock control, controlled deduction rules, and purchase-order receiving
- Document metadata center with customer-visible sharing safeguards
- Backup/export, audit log, security audit, deployment readiness guidance

## Known Limitations

- The app is still localStorage-first and data is not shared across devices automatically.
- There is no live backend yet.
- There is no real file server yet.
- There is no live QuickBooks or accounting integration yet.
- OpenAI API keys in frontend builds are still risky for public deployment.
- Playwright browser runs may fail in some local environments with `spawn EPERM`.

## Recommended Pre-Release Checks

- Run a production build
- Create a backup/export
- Open the customer portal and verify approval status rendering
- Confirm role-based access still works
- Verify print summary output
- Verify AI fallback behavior
- Verify booking, inventory, PO receiving, and document center flows

