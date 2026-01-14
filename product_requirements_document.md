# Product Requirements Document (PRD): Estimio

## 1. Product Vision

Estimio is an AI-powered estimating assistant for construction professionals that transforms rough project descriptions into detailed, market-accurate proposals in seconds. By automating the tedious estimation and invoicing process, it empowers independent contractors to win more bids and get paid faster without spending hours on paperwork.

## 2. User Personas

### Persona A: "Solo Sam" (The Handyman)

- **Role:** Independent Handyman / General Contractor.
- **Context:** Works alone or with a helper. Constantly on the go, managing jobs, supplies, and client calls from his truck.
- **Pain Point:** Hates typing out estimates on a phone screen at 8 PM after a long day. loses jobs because he takes too long to send a quote.
- **Goal:** Wants to speak into his phone ("Install a new vanity and faucet") and get a professional-looking PDF estimate to text the client immediately.

### Persona B: "Detail Dan" (The Remodeler)

- **Role:** Small Renovation Business Owner (3-5 employees).
- **Context:** Handles larger projects like kitchen/bath remodels. Needs accurate tracking of labor vs. materials.
- **Pain Point:** Generic AI tools hallucinate prices or miss details. He needs granular control over markups and labor rates to ensure profitability.
- **Goal:** A system that learns his specific pricing (Custom Rates) and allows for version-controlled revisions as the client changes their mind.

---

## 3. Functional Requirements

### Pillar 1: AI Estimation Engine

- User will be able to generate comprehensive estimates by providing text descriptions via a chat interface.
- User will be able to refine estimates iteratively (e.g., "Add a dimmer switch") without losing existing line items.
- User will be able to receive cost breakdowns that respect their specific currency (USD/CAD) and language (English/French) preferences.

### Pillar 2: Estimate Management & Versioning

- User will be able to save multiple versions of an estimate as snapshots.
- User will be able to "Time Travel" and restore a previous version of an estimate (automatically removing subsequent history).
- User will be able to duplicate existing estimates to quickly bid on similar projects.
- User will be able to customize the detail level of the proposal (e.g., Full Detail, Item Totals, Group Totals, Lump Sum) before sending.

### Pillar 3: Invoicing & Payments

- User will be able to convert a finalized Estimate into an Invoice with a single click.
- User will be able to track payments against invoices (Partial or Full) and view outstanding balances.
- User will be able to generate professional PDF invoices that include their business branding and payment instructions.

### Pillar 4: Client Relationship Management (CRM)

- User will be able to store client contact details (Name, Email, Address, Phone) and link them to multiple projects.
- User will be able to import client information directly into new estimates to save time.

### Pillar 5: Business Profile & Customization

- User will be able to define "Custom Rates" (e.g., "My Install Rate: $85/hr") that the AI MUST use over market averages.
- User will be able to set global default markups for Materials, Labor, and Subcontractors.
- User will be able to upload a business logo that appears on all generated PDFs.

---

## 4. User Stories & Acceptance Criteria

### Story 1: AI Estimate Generation

**As a** contractor, **I want** to generate an estimate by describing the work, **so that** I don't have to manually type every line item.

- **Given** I am in a new project draft
- **When** I send the message "Replace 3 standard outlets with USB-C outlets"
- **Then** the system should generate a line item group "Electrical"
- **And** it should include "USB-C Outlet" with valid material cost and "Install Outlet" with labor hours (unit: 'hr')
- **And** the output must NOT show "pre-markup" prices in the chat response.

### Story 2: Estimate Revisions

**As a** user, **I want** to add an item to an existing estimate, **so that** I can update the scope without rewriting the whole quote.

- **Given** I have an estimate with 5 line items
- **When** I type "Also add a ceiling fan installation"
- **Then** the new version should contain 6 line items (5 original + 1 new)
- **And** the total cost should reflect the addition
- **And** a new Version snapshot should be created in `estimate_versions`.

### Story 3: Version Restoration

**As a** user, **I want** to undo a mistake, **so that** I can go back to a previous good state.

- **Given** I am on Version 3 of an estimate
- **When** I select "Restore" on Version 1
- **Then** the current estimate data should match Version 1 exactly
- **And** Versions 2 and 3 should be permanently deleted from the database
- **And** chat messages associated with Versions 2 and 3 should be deleted.

### Story 4: Convert to Invoice

**As a** pro, **I want** to turn an estimate into an invoice, **so that** I can bill the client.

- **Given** an estimate with status 'Approved'
- **When** I click "Convert to Invoice"
- **Then** a new record should be created in the `invoices` table
- **And** all line items should be copied (not linked) to `invoice_line_items`
- **And** the original Estimate status should update to 'Closed'
- **And** the Invoice status should start as 'Outstanding'.

### Story 5: Custom Rates Application

**As a** business owner, **I want** the AI to use my specific prices, **so that** I don't lose money on underbid labor.

- **Given** I have set a Custom Rate for "Painting" at "$3.00/sqft"
- **When** I ask the AI to "Paint a 10x10 room"
- **Then** the generated line item for painting labor/material must calculate cost based on $3.00/sqft
- **And** the system prompt should have included this rate as a MANDATORY override.

### Story 6: Subscription Gating

**As a** SaaS platform, **I want** to restrict access to paid features, **so that** users convert to subscribers.

- **Given** a user's 7-day trial has expired
- **And** they do not have an active "Pro" entitlement in RevenueCat
- **When** they attempt to create a new Estimate
- **Then** the action should be blocked
- **And** they should be redirected to the Paywall screen.

---

## 5. Non-Functional Requirements

### Security

- **AI Prompt Injection:** System prompts are built server-side in Supabase Edge Functions (`chat-completion`) and never exposed to the client to prevent manipulation.
- **Row Level Security (RLS):** All database tables (`estimates`, `clients`, etc.) must have RLS policies enforcing `user_id = auth.uid()` to ensure strict data isolation between tenants.

### Performance

- **Optimistic Updates:** The React Native app must use TanStack Query optimistic updates for UI interactions (e.g., changing status, sending messages) to ensure the app feels "instant" even on poor cellular connections.
- **Asset Caching:** User context (Profile, Custom Rates) should be cached (staleTime: 5 mins) to minimize database round-trips during chat sessions.

### Scalability & Maintainability

- **Database Architecture:** Estimates and Invoices are decoupled (deep copy strategy). This allows the Invoice schema to evolve or handle partial billing in the future without breaking historical Estimates.
- **Mobile-First Design:** All logic is optimized for React Native/Expo environment; dependencies that do not work on mobile (like certain web-only libraries) are excluded or polyfilled.
