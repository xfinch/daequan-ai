# Comcast GHL Tag Standards

**Location ID:** nPubo6INanVq94ovAQNW  
**Last Updated:** 2026-06-08  
**Purpose:** Standardized tagging for consistent pipeline management and reporting

---

## ✅ APPROVED TAGS (Use These Only)

### Sales Pipeline (8 tags)
| Tag | When to Use |
|-----|-------------|
| `prospect` | New potential customer, not yet qualified |
| `hot-lead` | High interest, budget confirmed, ready to buy |
| `follow-up` | Needs follow-up action (use with due date) |
| `callback-requested` | Prospect asked for callback |
| `contract-concern` | Objection to contract terms/length |
| `decision-maker-identified` | DM confirmed but not yet contacted |
| `gatekeeper-identified` | Gatekeeper confirmed, DM unknown |
| `not-interested` | Qualified out, not a fit |

### Customer Status (5 tags)
| Tag | When to Use |
|-----|-------------|
| `existing-customer` | Currently has Comcast service |
| `win-back-opportunity` | Former customer, re-engagement potential |
| `upgrade-opportunity` | Current customer, upsell potential |
| `retention` | At-risk customer, save play active |
| `partner` | Referral partner (non-paid) |

### Activity Tracking (4 tags)
| Tag | When to Use |
|-----|-------------|
| `field-visit` | In-person visit completed |
| `door-knock` | Cold door knock (no contact) |
| `called` | Phone contact made |
| `business-card-capture` | Card collected, needs CRM entry |

### Territory/ZIP Codes (9 tags)
| Tag | Coverage |
|-----|----------|
| `zip-98070` | Vashon Island |
| `zip-98371` | Puyallup |
| `zip-98391` | Bonney Lake |
| `zip-98402` | Downtown Tacoma |
| `zip-98403` | North Tacoma |
| `zip-98404` | East Tacoma |
| `zip-98406` | West Tacoma |
| `zip-98407` | Proctor District |

### Business Categories (Use Sparingly)
- `restaurant`
- `medical-practice`
- `insurance`
- `auto-service`
- `multi-location`

**Rule:** Only tag business category if it affects sales approach or pricing.

---

## ❌ DEPRECATED TAGS (Do Not Use — Move to Notes)

| Old Tag | Move To |
|---------|---------|
| `email-acquired;-sydney-in-office-couple-times/week` | Contact note |
| `follow-up-with-diane` | Task assigned to + note |
| `franchise-opportunity---96-locations-total` | Opportunity value field |
| `established-2001` | Custom field or note |
| `pain-point:-overpaying` | Note under "Pain Points" |
| `referral-from-james-roddy` | Source field or note |
| `service-issue-resolved` | Activity log |
| `backfilled` | Internal process note |
| `manual-entry` | Source field |
| `analysis` | Pipeline stage, not tag |
| `bbe-opportunity` | Opportunity type field |
| `comcast-prospect` | Redundant — use `prospect` |
| `existing_comcast` | Use `existing-customer` |
| `existing customer` | Use `existing-customer` |
| `comcast visit` | Use `field-visit` |
| `field_visit` | Use `field-visit` |
| `field-visit-3-17` | Date-specific — use note |
| `followup` | Use `follow-up` |
| `follow-up-later` | Use `follow-up` + date |
| `follow-up-on-tv-service-discussion` | Use note |
| `gatekeeper-identified;-owner-unknown` | Use `gatekeeper-identified` + note |
| `hot-lead---3-locations` | Use `hot-lead` + `multi-location` |
| `initial_contact` | Activity log, not tag |
| `new` | Pipeline stage, not tag |
| `not-a-prospect` | Use `not-interested` |
| `owner-operator` | Note or custom field |
| `ownership-change` | Note or trigger event |
| `pipeline-sync` | Internal process, not customer tag |
| `return-visit-needed` | Use `follow-up` + note |
| `status: analysis` | Pipeline stage |
| `status: closed lost` | Pipeline stage |
| `status: existing` | Use `existing-customer` |
| `status: new` | Pipeline stage |
| `vance-referral` | Source field or note |
| `2026-05-16` | Date-specific — use note |

---

## Tagging Checklist

Before adding a tag, ask:
- [ ] Is this a **group** I need to filter/report on?
- [ ] Will this tag still matter in 6 months?
- [ ] Can this be a **note** or **custom field** instead?
- [ ] Am I duplicating pipeline stage info?
- [ ] Is this date-specific? (If yes → note, not tag)

**Max tags per contact:** 5-7 (pipeline + status + zip + 1-2 context)

---

## Reference

See also: [Tagging Principles](../docs/tagging-principles.md)
