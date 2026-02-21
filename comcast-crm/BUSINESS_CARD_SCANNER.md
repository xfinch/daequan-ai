# Business Card Scanner via WhatsApp

## Overview
When you send me a business card photo via WhatsApp, I'll:
1. Analyze the image using AI vision
2. Extract: Name, Phone, Email, Address, Interest Level, Notes
3. Create a visit in MongoDB + sync to GHL
4. Handle missing required fields with reminders

## Required Fields
- ✅ Name (contact name)
- ✅ Phone number
- ✅ Email
- ✅ Address (street, city, state, zip)

## Optional Fields
- Interest level (interested, followup, not-interested, called, customer)
- Notes (any additional context)

## Missing Information Protocol
If any required field is missing or unclear:
1. Fill with "Unknown" placeholder
2. Create a GHL task/reminder to collect missing info
3. Tag the visit as "needs_follow_up"
4. Include in daily summary

## Usage
**WhatsApp:** Send photo with caption like:
- "Business card from today"
- "Met at networking event - interested in internet"
- "Follow up needed - get email"

## Output
Creates visit with:
- Contact info from card
- Geocoded address (lat/lng for map pin)
- Status based on your caption notes
- Deep link to GHL contact

---
*System: AI-powered business card OCR via WhatsApp*
