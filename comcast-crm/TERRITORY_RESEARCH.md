# Comcast Territory Research & Visit Planning System

**Date:** February 25, 2026  
**Territories:** Tacoma, Buckley, Bonney Lake, Carbonado  
**Objective:** Proactive lead generation + intentional field visit planning

---

## 📊 Data Sources Identified

### 1. Washington State Liquor Control Board (LCB)

**Licensee Database:**
- **URL:** https://licensinginfo.lcb.wa.gov/LicenseeListDetails.asp
- **Trade Area Map:** https://gis.lcb.wa.gov/portal/apps/webappviewer/index.html?id=6f28bda1e4364cb4ac149bda593a19a2

**Key License Types for Prospecting:**

| License Type | Code | Prospect Value |
|-------------|------|----------------|
| Washington Public House | 470 | **HIGH** - Bars/Restaurants needing internet |
| Craft Distillery | 351 | **HIGH** - Production facilities, need business internet |
| Domestic & Microbreweries | 326 | **HIGH** - Breweries need reliable internet for operations |
| Wine Importer | 336 | MEDIUM - Distribution offices |
| Beer Distributor | 320 | MEDIUM - Warehouses/offices |
| Spirits Retailer | 482 | MEDIUM - Retail locations |

**Download Method:**
- Individual license type lists available as .asp files
- Must save as Excel: File → Save As → Microsoft Excel (*.xls)
- Filter by city/zip after download

---

### 2. Washington Secretary of State - Business Entity Search

**Advanced Search:**
- **URL:** https://ccfs.sos.wa.gov/#/AdvancedSearch
- **Organization Search:** https://ccfs.sos.wa.gov/#/

**Search Capabilities:**
- Business name
- Date range (filed in last 30/60/90 days)
- Entity type (LLC, Corp, Partnership)
- Principal office city

**Target Entity Types:**
- LLC (Limited Liability Company) - Most new businesses
- Profit Corporation - Established businesses
- Limited Partnership - Investment groups

---

### 3. Target Zip Codes for Territory

| City | Primary Zip Codes | County | Business Density |
|------|------------------|--------|-----------------|
| **Tacoma** | 98402, 98403, 98404, 98405, 98406, 98407, 98408, 98409, 98418, 98421, 98422, 98424, 98444, 98445, 98446, 98447, 98465, 98466 | Pierce | **HIGH** |
| **Buckley** | 98321 | Pierce | MEDIUM |
| **Bonney Lake** | 98391 | Pierce | **HIGH** (growing) |
| **Carbonado** | 98323 | Pierce | LOW (rural) |

---

## 🎯 Prospecting Strategy

### Priority 1: New Liquor Licenses (Last 30-90 Days)
**Why:** New bars/restaurants = immediate internet need, no existing contracts

**Action Steps:**
1. Download Public House (470) licensee list
2. Filter for zip codes: 98402-98409, 98321, 98391, 98323
3. Cross-reference with Comcast CRM to avoid duplicates
4. Add as "Hot Lead" pins to map

### Priority 2: New Business Registrations (Last 30 Days)
**Why:** Brand new businesses need everything - internet, phone, possibly TV

**Action Steps:**
1. Search SOS for entities filed in last 30 days
2. Filter by zip codes
3. Research business type (retail, office, restaurant, etc.)
4. Categorize by Comcast package potential:
   - **Triple Play:** Restaurants, bars, salons
   - **Double Play:** Retail, small offices
   - **Internet Only:** Home-based businesses

### Priority 3: Craft Alcohol Producers
**Why:** Breweries/distilleries have specific business internet needs + visitor WiFi

**Target:**
- Craft Distilleries (351)
- Microbreweries (326)
- Wineries (327)

---

## 🗺️ Visit Planning System

### Phase 1: Data Aggregation Script
Create automated scraper that:
1. Pulls new LCB licenses weekly
2. Pulls new SOS business filings weekly
3. Geocodes addresses to lat/lng
4. Cross-references with existing CRM contacts
5. Assigns priority scores

### Phase 2: Route Optimization
Group prospects by:
- Geographic cluster (5-mile radius)
- Priority score (Hot/Warm/Cold)
- Business hours (for optimal visit timing)
- Day of week patterns

### Phase 3: Visit Plans
Generate daily visit routes with:
- 8-10 prospects per day
- Pre-loaded into map with notes
- Estimated drive time between stops
- Suggested talking points per business type

---

## 🛠️ Implementation Options

### Option A: Manual Weekly Process
1. Mondays: Download LCB lists
2. Tuesdays: Search SOS new filings
3. Wednesdays: Research and categorize
4. Thursdays: Plan next week's routes
5. Fridays: Update CRM with visit outcomes

### Option B: Automated Scraping (Recommended)
Build scripts to:
- Scrape LCB licensee lists daily
- Query SOS API for new filings
- Auto-geocode and add to CRM
- Generate weekly visit plans automatically

**Technical Requirements:**
- Puppeteer/Playwright for LCB scraping
- SOS CCFS API integration (if available)
- Google Maps API for geocoding
- Integration with existing Comcast CRM

---

## 📋 Next Steps

1. **Immediate:**
   - [ ] Download Public House (470) licensee list
   - [ ] Search SOS for last 30 days filings in target zips
   - [ ] Export current CRM data for cross-reference

2. **This Week:**
   - [ ] Build manual process for weekly data pulls
   - [ ] Create spreadsheet template for visit planning
   - [ ] Test route with 5-10 prospects

3. **Next Sprint:**
   - [ ] Automate data collection
   - [ ] Build visit plan generator
   - [ ] Integrate with existing map system

---

## 🔗 Quick Access Links

**WA LCB Licensee List:**  
https://lcb.wa.gov/taxreporting/licensee-list

**WA SOS Business Search:**  
https://ccfs.sos.wa.gov/#/AdvancedSearch

**LCB Trade Area Map:**  
https://gis.lcb.wa.gov/portal/apps/webappviewer/index.html?id=6f28bda1e4364cb4ac149bda593a19a2

**WA DOR Business Lookup:**  
https://dor.wa.gov/

---

*Research compiled for: Comcast Business Account Executive - Xavier*  
*Target launch: Visit planning system by March 1, 2026*
