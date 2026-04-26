# DVI Frontend Release Checklist

Use this checklist before shipping the current frontend build to a real shop environment.

## Build

- Run `npm run build`
- Confirm the build completes without TypeScript errors
- Review any bundle-size warnings

## Data Safety

- Create a backup/export before major updates
- Verify restore preview works before importing data
- Store backups outside the browser/computer

## Smoke Tests

- Open the app and verify login works
- Load simulated/demo data and confirm dashboards render
- Check customer portal opening, approvals, and read-only behavior
- Verify booking creation, including multi-service selection
- Verify inventory, PO Lite, supplier directory, and document center pages
- Verify finance and accounting-prep pages for allowed roles
- Verify hybrid AI fallback behavior when Ollama/OpenAI are unavailable

## Role / Permission Checks

- Admin can access all required modules
- Restricted roles are blocked from sensitive modules
- Customer portal does not show internal cost, margin, or supplier bid data

## Print / Customer Output

- Preview customer print summaries
- Confirm internal cost, margin, supplier quotes, and audit notes are not shown
- Verify release and approval summaries are customer-friendly

## AI Checks

- Confirm AI can fall back to local/template modes safely
- Review checkbox is required before using customer-facing AI drafts
- Confirm AI logs save the provider and review status

## Booking / Inventory / PO

- Confirm multi-service booking works in staff and customer flows
- Confirm inventory adjustments and PO receiving remain visible and logged
- Confirm purchase order receiving history renders safely

## Final Sign-Off

- Customer portal test passes
- Booking test passes
- Inventory / PO test passes
- Backup / restore test passes
- AI fallback test passes
- Release summary print preview test passes

