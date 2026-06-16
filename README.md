# DocTrack — Document Workflow & Accounts Receivable Management

A frontend MVP for managing high-volume document workflows and accounts receivable
in companies processing 200+ document packages per month.

## What this is

This is a client-facing demo application with no backend.
All data is hardcoded mocks. The purpose is to validate product-market fit
with potential clients before building a full backend.

## Who this is for

Companies with high document throughput — typically 200+ document packages per month —
where tracking contract status, payment deadlines, and signatory progress
across multiple projects and counterparties becomes a bottleneck.
Examples: advertising agencies, media buying companies, project-based service firms,
and any B2B company managing large volumes of contracts, acts, and invoices.

## What is implemented

- Clients section — project list with expandable document rows, filters, drag-and-drop, progress bar, overdue indicators
- Contractors section — two tabs: client contractors and internal contractors
- Receivables section — accounts receivable tracking, overdue highlighting, dynamics charts
- Document editor page
- Create project modal
- Create document modals for client and vendor documents

## What is not implemented (mock only)

- Authentication and user accounts
- Backend API and database
- Real file upload and document storage
- Email notifications
- Settings and archive sections

## Stack

- React 18 + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- dnd-kit (drag and drop)
- Recharts (charts in receivables)
- Supabase JS (installed, not yet connected)

## Local development

npm install
npm run dev

## Working with Claude Code

Read CLAUDE.md before making any changes.
