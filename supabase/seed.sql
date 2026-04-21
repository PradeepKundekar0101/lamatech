-- Seed data for the reports table. Safe to re-run: uses ON CONFLICT.

insert into public.reports (id, title, author, category, status, summary, body, views, tags, created_at, updated_at) values
('rpt_001', 'Q1 Growth Retrospective', 'Maya Chen', 'growth', 'published',
 'Quarter-over-quarter growth slowed in Feb but recovered with the new onboarding flow.',
 'Activation rate climbed from 38% to 51% after we shipped the simplified onboarding in week 7. Paid-channel CAC remained flat at $42, but blended CAC dropped to $28 thanks to organic referral lift. Churn ticked up among annual cohorts that converted from the legacy pricing page; we suspect a mismatch between expectation and feature surface area. Recommended next steps: tighten paywall messaging, formalize a referral incentive, and re-run the activation experiment on the mobile web flow where drop-off is highest.',
 1284, array['growth','activation','retention'],
 '2026-01-12T10:15:00Z', '2026-04-02T08:30:00Z'),

('rpt_002', 'Edge Runtime Migration Postmortem', 'Sasha Petrov', 'engineering', 'published',
 'Moving the public API to Edge cut p95 by 41% but exposed three serialization bugs.',
 'Migrating the public API to the Vercel Edge runtime delivered a 41% reduction in p95 latency for read endpoints. Three regressions surfaced: a Date serialization mismatch in the report payload, a missing polyfill for crypto.subtle in older clients, and a streaming response that broke our existing telemetry parser. All three were resolved within 48 hours. Long-term we recommend a dedicated edge-compatibility lint and contract tests against the Edge runtime in CI.',
 892, array['edge','performance','postmortem'],
 '2026-02-01T14:00:00Z', '2026-02-18T11:42:00Z'),

('rpt_003', 'March Burn & Runway', 'Idris Okafor', 'finance', 'in_review',
 'Burn dropped 12% MoM; runway extended to 19 months at current spend.',
 'Net burn for March was $186k, down 12% from February''s $211k. The reduction is primarily explained by the renegotiated infra contract and a one-time refund from our previous observability vendor. Revenue grew 7% MoM. At the current burn and growth trajectory, runway extends to 19 months without any further fundraising. Suggested watch items: marketing spend is creeping up and starting to outpace pipeline, and the new hire ramp will pull burn back up in Q3.',
 421, array['finance','burn','runway'],
 '2026-04-05T09:00:00Z', '2026-04-15T17:22:00Z'),

('rpt_004', 'Mobile Web Conversion Audit', 'Nora Lindqvist', 'product', 'published',
 'Mobile web converts at 2.1% vs 4.8% on desktop. Three concrete fixes identified.',
 'A funnel audit across the last 60 days shows mobile web converts to signup at 2.1%, less than half of desktop''s 4.8%. The biggest single drop is on the pricing page where the comparison table forces horizontal scroll. The second is a hero CTA that sits below the fold on most Android devices. The third is a checkout step that triggers an iOS keyboard layout shift, hiding the submit button. Each is a 2-3 hour fix and we estimate combined uplift of ~25% on mobile signups.',
 657, array['product','conversion','mobile'],
 '2026-03-08T12:30:00Z', '2026-03-30T08:05:00Z'),

('rpt_005', 'User Research: Power Users vs Casual', 'Hiroshi Tanaka', 'research', 'draft',
 'Power users want batch ops and keyboard shortcuts; casual users want fewer choices.',
 'We conducted twelve interviews split evenly between power users (>5 sessions/week) and casual users (<1 session/week). Power users overwhelmingly asked for batch operations, keyboard shortcuts, and a more compact information density. Casual users described the current product as ''overwhelming'' and consistently asked for guided defaults and fewer top-level options. The clearest opportunity is a lightweight ''simple mode'' toggle that hides advanced surfaces by default, paired with a power-user-only keyboard palette.',
 188, array['research','ux','personas'],
 '2026-04-10T16:45:00Z', '2026-04-18T10:00:00Z'),

('rpt_006', 'Incident Review: Auth Outage 03-22', 'Sasha Petrov', 'engineering', 'published',
 '47-minute auth outage caused by a stale JWT key cache after rotation.',
 'On March 22 at 14:08 UTC we experienced a 47-minute auth outage. Root cause: after rotating our JWT signing keys, the verification cache in the edge worker did not invalidate, so newly issued tokens failed verification. Mitigations: forced cache flush on rotation, added a synthetic monitor for end-to-end auth on every region every 60 seconds, and a runbook that explicitly covers key rotation. No data loss occurred; logged-in sessions were unaffected.',
 743, array['incident','auth','reliability'],
 '2026-03-23T09:00:00Z', '2026-03-29T14:10:00Z'),

('rpt_007', 'Pricing Experiment: Tiered vs Usage', 'Maya Chen', 'growth', 'in_review',
 'Usage-based pricing won on revenue per account but lost on close rate.',
 'We A/B tested tiered pricing against pure usage-based pricing for 6 weeks across new inbound. Usage-based produced 22% higher revenue per closed account but converted 18% fewer trials. Sales feedback consistently flagged unpredictability as the friction point. Recommendation: ship a hybrid where each tier includes a usage allowance, with overages billed at a clear rate. This preserves the predictability that converts trials while capturing upside on heavy users.',
 312, array['pricing','experiment','revenue'],
 '2026-04-12T11:20:00Z', '2026-04-19T15:00:00Z'),

('rpt_008', 'Annual Compliance Snapshot', 'Idris Okafor', 'finance', 'archived',
 'All material controls passing. Two informational findings to address before next audit.',
 'Annual snapshot of SOC 2 controls. All material controls are passing with no exceptions. Two informational findings: (1) access reviews for staging environments are not consistently logged with the same rigor as production, and (2) one third-party processor agreement is approaching expiration without a renewal in flight. Both are scheduled for resolution in May. No customer-impacting risks identified.',
 96, array['compliance','soc2','audit'],
 '2025-12-01T10:00:00Z', '2026-01-15T09:30:00Z')
on conflict (id) do update set
  title = excluded.title,
  author = excluded.author,
  category = excluded.category,
  status = excluded.status,
  summary = excluded.summary,
  body = excluded.body,
  views = excluded.views,
  tags = excluded.tags,
  updated_at = excluded.updated_at;
