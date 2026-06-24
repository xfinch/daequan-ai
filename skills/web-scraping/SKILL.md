---
name: "web-scraping"
description: "Web scraping patterns for government data sources, rate limiting, HTML parsing, and change detection"
---

# Web Scraping Skill

## Overview
Reusable patterns for scraping government data sources, handling rate limits, parsing HTML tables, and detecting changes over time.

## Procedures

### 1. Scrape LCB License Lists
**Use when:** Fetching liquor license data from WA LCB website

**Steps:**
1. Identify license type codes and descriptions
2. Build URL: `https://licensinginfo.lcb.wa.gov/LicenseeListDetails.asp?typeLic={CODE}&PrivDesc={DESC}`
3. Fetch with 500ms delay between requests
4. Parse HTML table with regex pattern:
   ```
   /<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*(?:&nbsp;)?(?:<b>)?([^<]+)(?:<\/b>)?(?:<\/font>)?\s*<\/td>/gi
   ```
5. Filter by territory ZIP codes
6. Compare against previous run to find new entries

**Rate Limiting:** 500ms between requests, respect robots.txt

### 2. Parse HTML Tables
**Use when:** Extracting data from simple HTML table structures

**Pattern:**
- Match table rows with `/<tr[^>]*>(.*?)<\/tr>/gis`
- Extract cells with `/<td[^>]*>(.*?)<\/td>/gi`
- Strip HTML tags: `html.replace(/<[^>]+>/g, '')`
- Handle `&nbsp;` and HTML entities

### 3. Change Detection
**Use when:** Tracking new entries over time

**Steps:**
1. Load previous run data from JSON file
2. Create lookup key: `{license_number}-{business_name}`
3. Compare current vs previous sets
4. Output only new entries
5. Save current run as new baseline

### 4. Filter by Territory
**Use when:** Filtering businesses by ZIP code

**Pattern:**
```javascript
const TERRITORY_ZIPS = ['98402', '98403', ...];
const filtered = businesses.filter(b => TERRITORY_ZIPS.includes(b.zip));
```

## Error Handling
- Timeout after 30 seconds
- Retry failed requests (max 3 attempts)
- Log errors but continue processing other license types

## Output Formats
- JSON for structured data
- CSV for spreadsheet import
- Notification text for alerts

## Example Usage
```javascript
const scraper = require('./web-scraping');
const results = await scraper.scrapeLCB({
  licenseTypes: ['Microbrewery', 'Winery'],
  zipCodes: ['98402', '98403'],
  notify: true
});
```
