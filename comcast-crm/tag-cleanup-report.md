# Tag Cleanup Audit Report

**Generated:** 2026-06-08  
**Location ID:** nPubo6INanVq94ovAQNW  
**Total contacts with tags:** 100  
**Contacts needing cleanup:** 91

---

## Summary

91% of tagged contacts have deprecated tags that need migration. The biggest issues:

| Issue | Count | Fix |
|-------|-------|-----|
| `comcast-prospect` → `prospect` | 72 | Bulk rename |
| `interested` → `hot-lead` | 22 | Bulk rename |
| `zip-` (empty) | 15 | Remove or correct |
| `initial_contact` | 11 | Remove (use activity log) |
| `followup` → `follow-up` | 9 | Bulk rename |
| `comcast visit` → `field-visit` | 8 | Bulk rename |

---

## Deprecated Tags in Use

| Tag | Contacts | Migration |
|-----|----------|-----------|
| comcast-prospect | 72 | → prospect |
| interested | 22 | → hot-lead |
| zip- | 15 | → Remove or correct ZIP |
| initial_contact | 11 | → Remove (use activity log) |
| followup | 9 | → follow-up |
| comcast visit | 8 | → field-visit |
| customer | 4 | → existing-customer |
| existing customer | 3 | → existing-customer |
| status: new | 3 | → Remove (use pipeline) |
| return-visit-needed | 3 | → follow-up + note |
| status: analysis | 2 | → Remove (use pipeline) |
| status: existing | 2 | → existing-customer |
| not-interested | 2 | → Keep (approved) |
| decision-maker-identified | 2 | → Move to note |
| manual-entry | 1 | → Move to source field |
| status: closed lost | 1 | → Remove (use pipeline) |
| field_visit | 1 | → field-visit |
| 2026-05-16 | 1 | → Move to note |
| ownership-change | 1 | → Move to note |
| hot-prospect | 1 | → hot-lead |
| service-issue-resolved | 1 | → Move to activity log |
| multi-site | 1 | → multi-location |
| hold-down-account | 1 | → Move to note |
| vance-referral | 1 | → partner + note |
| called | 1 | → Remove (use activity log) |
| existing-customer-check | 1 | → Remove |
| bbe-opportunity | 1 | → Move to opportunity field |
| established-2001 | 1 | → Move to custom field |
| owner-operator | 1 | → Move to note |
| follow-up-on-tv-service-discussion | 1 | → Move to note |
| not-a-prospect | 1 | → not-interested |
| existing-customer---retention-play | 1 | → existing-customer + retention |
| consider-different-approach-or-deprioritize | 1 | → not-interested + note |
| email-acquired;-sydney-in-office-couple-times/week | 1 | → Move to note |
| multi-business-owner---2-locations-so-far | 1 | → multi-business-owner + note |
| major-franchise-opportunity | 1 | → hot-lead + note |
| email-acquired;-needs-follow-up | 1 | → follow-up + note |
| hot-lead---3-locations | 1 | → hot-lead + multi-location |
| pain-point:-overpaying | 1 | → Move to note |
| follow-up-with-diane | 1 | → Create task for Diane |
| franchise-opportunity---96-locations-total | 1 | → Move to opportunity value |
| gatekeeper-identified;-owner-unknown | 1 | → gatekeeper-identified + note |
| gatekeeper-identified | 1 | → Move to note |

---

## Priority Contacts for Cleanup

### High Priority (4+ deprecated tags)

**walker null** (mF72a5Ir2Wfp1vUzUnXF)
- Tags: comcast-prospect, zip-98070, followup, bbe-opportunity, radiant-heat, established-2001
- Action: 
  - Rename comcast-prospect → prospect
  - Rename followup → follow-up
  - Move bbe-opportunity to opportunity type field
  - Move established-2001 to note

**cheryl pruett** (1KJL5mO7pw2f4OqTHwvC)
- Tags: comcast-prospect, zip-98070, called, pet-supplies, existing-customer-check
- Action:
  - Rename comcast-prospect → prospect
  - Remove called (use activity log)
  - Remove existing-customer-check

### Medium Priority (3 deprecated tags)

- mark null, galena null, guinn null, linda/amy/sammy null, juan, sydney null, patrick null, celine ozuna

---

## Bulk Actions Needed

### 1. Rename Tags (Bulk API Call)
```
comcast-prospect → prospect (72 contacts)
interested → hot-lead (22 contacts)
followup → follow-up (9 contacts)
comcast visit → field-visit (8 contacts)
customer → existing-customer (4 contacts)
existing customer → existing-customer (3 contacts)
status: existing → existing-customer (2 contacts)
field_visit → field-visit (1 contact)
hot-prospect → hot-lead (1 contact)
multi-site → multi-location (1 contact)
not-a-prospect → not-interested (1 contact)
```

### 2. Remove Tags (Manual Review)
```
initial_contact (11 contacts) - use activity log
status: new (3 contacts) - use pipeline stage
status: analysis (2 contacts) - use pipeline stage
status: closed lost (1 contact) - use pipeline stage
zip- (15 contacts) - remove or correct
```

### 3. Migrate to Notes/Fields (Manual)
```
decision-maker-identified (2 contacts)
ownership-change (1 contact)
hold-down-account (1 contact)
owner-operator (1 contact)
gatekeeper-identified (1 contact)
email-acquired;-sydney-in-office-couple-times/week (1 contact)
pain-point:-overpaying (1 contact)
follow-up-on-tv-service-discussion (1 contact)
email-acquired;-needs-follow-up (1 contact)
return-visit-needed (3 contacts)
established-2001 (1 contact)
manual-entry (1 contact)
service-issue-resolved (1 contact)
consider-different-approach-or-deprioritize (1 contact)
multi-business-owner---2-locations-so-far (1 contact)
major-franchise-opportunity (1 contact)
hot-lead---3-locations (1 contact)
gatekeeper-identified;-owner-unknown (1 contact)
```

### 4. Create Tasks (Manual)
```
follow-up-with-diane (1 contact) - Create task assigned to Diane
```

### 5. Update Opportunity Fields (Manual)
```
bbe-opportunity (1 contact)
franchise-opportunity---96-locations-total (1 contact)
```

---

## Cleanup Script

See `scripts/cleanup-tags.sh` for automated bulk renames.

## Post-Cleanup Target

**Before:** 134 unique tags  
**After:** ~26 approved tags

**Expected contact tag counts:**
- Most contacts: 2-4 tags (pipeline + status + zip + category)
- Complex accounts: 5-7 tags max

---

*Next review: After cleanup completion*
