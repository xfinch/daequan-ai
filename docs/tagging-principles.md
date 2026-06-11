# Tagging Principles

**Version:** 1.0  
**Date:** 2026-06-08  
**Applies to:** All GHL sub-accounts (Comcast, TTL, etc.)

---

## The Core Rule

> **Tags are for grouping. Notes are for details.**

If you can't imagine running a report on it, it shouldn't be a tag.

---

## What Belongs in Tags

| Use Tag For | Example |
|-------------|---------|
| **Pipeline stage** | `hot-lead`, `follow-up` |
| **Customer status** | `existing-customer`, `win-back-opportunity` |
| **Territory/region** | `zip-98407`, `proctor-district` |
| **Activity type** | `field-visit`, `called` |
| **Business category** (if affects sales approach) | `restaurant`, `multi-location` |
| **Partner type** | `partner`, `referral-partner` |

---

## What Belongs in Notes/Fields

| Use Notes/Fields For | Example |
|----------------------|---------|
| **Specific details** | "Sydney in office couple times/week" |
| **Names of people** | "Follow up with Diane" |
| **Dates** | "Established 2001" |
| **Pain points** | "Overpaying by $200/mo" |
| **Referral sources** | "Referred by James Roddy" |
| **Counts/quantities** | "96 locations total" |
| **One-time events** | "Service issue resolved 3/15" |
| **Internal process** | "Backfilled from old system" |

---

## The Tests

Before creating a new tag, pass all three tests:

### 1. The Filter Test
> *"Will I ever need to filter my entire database by this?"*

❌ `follow-up-with-diane` — No, you'd assign a task to Diane instead  
✅ `follow-up` — Yes, show all contacts needing follow-up

### 2. The Time Test
> *"Will this tag still be accurate/relevant in 6 months?"*

❌ `2026-05-16` — No, date-specific  
✅ `field-visit` — Yes, permanent activity record

### 3. The Duplicate Test
> *"Am I duplicating info that's already in pipeline stages or custom fields?"*

❌ `status: analysis` — Pipeline already has stages  
✅ `hot-lead` — Qualifier beyond pipeline stage

---

## Anti-Patterns to Avoid

### ❌ Tag Sprawl
```
❌ email-acquired;-sydney-in-office-couple-times/week
❌ follow-up-on-tv-service-discussion
❌ franchise-opportunity---96-locations-total
```

### ✅ Clean Alternative
```
Tags: [follow-up, zip-98407]
Notes: "Sydney in office couple times/week. TV service discussion pending. 96-location franchise opportunity."
```

---

## Naming Conventions

| Rule | Good | Bad |
|------|------|-----|
| Lowercase with hyphens | `hot-lead` | `Hot Lead`, `hot_lead` |
| No dates in names | `field-visit` | `field-visit-3-17` |
| No sentences | `callback-requested` | `callback requested by owner` |
| No duplicates | `existing-customer` | `existing_customer`, `existing customer` |
| No semicolons | `gatekeeper-identified` | `gatekeeper-identified;-owner-unknown` |

---

## Maintenance

### Monthly Review
1. Run report: "Contacts with 8+ tags"
2. Review top 10 most-used tags
3. Consolidate duplicates
4. Archive unused tags

### Quarterly Audit
1. Export all tags in use
2. Identify non-standard tags
3. Migrate notes/details out of tags
4. Update documentation

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  IS IT A...?          →   USE...                        │
├─────────────────────────────────────────────────────────┤
│  Group/category       →   TAG                           │
│  Status/pipeline      →   TAG                           │
│  Territory/region     →   TAG                           │
│  Activity type        →   TAG                           │
├─────────────────────────────────────────────────────────┤
│  Specific detail      →   NOTE                          │
│  Person's name        →   NOTE / TASK                   │
│  Date/time            →   NOTE / CUSTOM FIELD           │
│  Dollar amount        →   OPPORTUNITY VALUE             │
│  One-time event       →   ACTIVITY LOG                  │
│  Internal process     →   NOTE (private)                │
└─────────────────────────────────────────────────────────┘
```

---

## Related Documents

- [Comcast Tag Standards](../comcast-crm/tag-standards.md)
- GHL Custom Fields Guide (link TBD)
- Opportunity Management SOP (link TBD)
