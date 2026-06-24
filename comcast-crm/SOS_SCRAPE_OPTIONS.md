# WA Secretary of State - New Business Scraper Options

## Current Status: No Free Public API Available

The WA Secretary of State's Corporations and Charities System (CCFS) does not provide a public API for searching new business filings by ZIP code or date range.

## Option 1: Manual Bulk Data Download (Recommended - Free)

**URL:** https://www.sos.wa.gov/corporations-charities/business-entities/corporations-data-extract-download

**What you get:**
- Full database dump of all WA corporations/LLCs
- Updated daily/weekly
- CSV format
- Includes: business name, filing date, address, registered agent, status

**Process:**
1. Download the CSV file (usually 100-200MB)
2. Filter for your ZIP codes
3. Filter for recent filing dates (last 30 days)
4. Import to your CRM

**Cost:** Free
**Time:** ~30 minutes/week manual work

## Option 2: Browser Automation Scraper (Free, More Complex)

**Tool:** Puppeteer or Playwright

**What it does:**
- Automates the CCFS website search
- Searches by city name (Tacoma, Bonney Lake, Buckley)
- Filters by date range
- Extracts new filings

**Challenges:**
- CCFS uses Angular/React - requires JavaScript execution
- Rate limiting (don't hammer their servers)
- Fragile (breaks when they update the site)

**Cost:** Free (but requires setup time)
**Time:** 2-3 hours to build, runs automatically

## Option 3: OpenCorporates API (Paid)

**URL:** https://api.opencorporates.com/

**Features:**
- Search by jurisdiction (us_wa)
- Filter by location/address
- Date range queries
- JSON API

**Cost:** 
- Free tier: 200 requests/day (not enough)
- Paid tier: $100+/month

**Not recommended** for your use case (too expensive)

## Option 4: Third-Party Data Providers (Paid)

**Options:**
- Data.com (Dun & Bradstreet)
- ZoomInfo
- Lead411
- InsideView

**Cost:** $100-500/month
**Not recommended** - you specifically want to avoid paid platforms

## Recommended Approach

### Phase 1: Manual (This Week)
1. Go to https://www.sos.wa.gov/corporations-charities/business-entities/corporations-data-extract-download
2. Download the CSV
3. Filter for your ZIP codes in Excel/Google Sheets
4. Check filing dates for last 30 days

### Phase 2: Semi-Automated (Next Week)
I can build a script that:
1. Downloads the bulk data automatically (if direct link available)
2. Filters for your ZIP codes
3. Compares against previous download
4. Outputs new businesses only

### Phase 3: Fully Automated (If Needed)
If the bulk download approach doesn't work well, we can build a browser automation scraper using Puppeteer.

## What About WASOS?

WASOS (Washington State Open Data) has:
- ✅ LCB Liquor License data (we're already scraping this)
- ❌ No Secretary of State corporation data with date filters
- ❌ No "new business" feed

The LCB data is actually the best free source for new business leads in your territory because:
1. New liquor licenses = new restaurants/bars (high-value prospects)
2. Updated regularly
3. Includes addresses and phone numbers
4. Filterable by ZIP code

## Next Steps

Want me to:
1. **Build the bulk data processor** - Script that downloads and filters the SOS CSV?
2. **Build a browser scraper** - Puppeteer-based scraper for the CCFS website?
3. **Focus on LCB only** - The LCB data is likely sufficient for prospecting

The LCB data catches most of your target prospects (restaurants, bars, breweries) because they all need liquor licenses. The SOS data would catch other business types (retail, offices, etc.) but with more effort.
