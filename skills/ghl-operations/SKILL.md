---
name: "ghl-operations"
description: "GoHighLevel API operations for contact management, tags, pipelines, and custom fields"
---

# GHL Operations Skill

## Overview
Reusable patterns for GoHighLevel API operations including contact management, tagging, pipeline stages, and custom fields.

## Configuration

### Environment Variables
- `GHL_TTL_TOKEN` - The Traffic Link sub-account
- `GHL_COMCAST_TOKEN` - Comcast sub-account  
- `GHL_AGENCY_TOKEN` - Agency-level token

### Location IDs
- TTL: `mhvGjZGZPcsK3vgjEDwI`
- Comcast: `nPubo6INanVq94ovAQNW`

### API Base
`https://services.leadconnectorhq.com`

## Procedures

### 1. Search Contacts
**Use when:** Looking up a contact by name, email, or phone

**Endpoint:** `GET /contacts/`
**Headers:**
- `Authorization: Bearer {token}`
- `Version: 2021-04-15`

**Query Parameters:**
- `query` - Search term (name, email, phone)
- `locationId` - Sub-account location ID

**Pattern:**
```javascript
const searchGHL = async (query, locationId, token) => {
  const response = await fetch(
    `https://services.leadconnectorhq.com/contacts?query=${encodeURIComponent(query)}&locationId=${locationId}`,
    { headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }}
  );
  return await response.json();
};
```

**Important:** Search returns partial matches. Try variations if no results:
- Full name → First name only → Company name → Email domain

### 2. Create Contact
**Use when:** Adding a new prospect to GHL

**Endpoint:** `POST /contacts/`
**Body:**
```json
{
  "locationId": "LOCATION_ID",
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "phone": "...",
  "address1": "...",
  "city": "...",
  "state": "...",
  "postalCode": "...",
  "tags": ["tag1", "tag2"],
  "source": "...",
  "customFields": [{"id": "...", "value": "..."}]
}
```

### 3. Update Contact
**Use when:** Modifying existing contact

**Endpoint:** `PUT /contacts/{contactId}`
**Note:** Only include fields being changed

### 4. Add Tags
**Use when:** Tagging contacts for segmentation

**Endpoint:** `POST /contacts/{contactId}/tags`
**Body:** `{ "tags": ["tag1", "tag2"] }`

**Tag Standards (Comcast):**
- `prospect` - New lead
- `visited` - Field visit completed
- `follow-up` - Needs follow-up
- `not-interested` - Declined
- `customer` - Signed up

### 5. Create Task
**Use when:** Creating follow-up reminders

**Endpoint:** `POST /contacts/{contactId}/tasks`
**Body:**
```json
{
  "title": "Follow up with {business_name}",
  "dueDate": "2026-06-30T17:00:00.000Z",
  "completed": false
}
```

### 6. Send Email
**Use when:** Sending email via GHL

**Endpoint:** `POST /conversations/messages`
**Body:**
```json
{
  "contactId": "CONTACT_ID",
  "type": "Email",
  "message": "Email body"
}
```

## Error Handling
- 401: Check token expiration
- 429: Rate limit hit, wait and retry
- 404: Contact not found
- Always validate response before proceeding

## Multi-Source Search Pattern
When searching for a contact:
1. Search GHL first
2. Check SQLite local cache
3. Check email history
4. Ask user for clarification if not found

## Example Usage
```javascript
const ghl = require('./ghl-operations');

// Search across multiple data sources
const contact = await ghl.findContact({
  name: 'John Doe',
  email: 'john@example.com',
  locationId: 'nPubo6INanVq94ovAQNW',
  token: process.env.GHL_COMCAST_TOKEN
});

// Create with tags
await ghl.createContact({
  ...contactData,
  tags: ['lcb-prospect', 'restaurant']
});
```
