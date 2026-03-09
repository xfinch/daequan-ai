# Connected Partners — Newsletter Template Variables

## Template Usage

This template is designed for **SalesLoft** and modern email clients. It uses:
- Single-column layout (mobile-first)
- System fonts for fast rendering
- CSS that degrades gracefully in Outlook
- Dark mode support

## Variable Placeholders

| Variable | Description | Example |
|----------|-------------|---------|
| `{{PREVIEW_TEXT}}` | Hidden preview text in inbox | "New gigabit pricing + territory updates" |
| `{{ISSUE_NUMBER}}` | Issue number | "001" |
| `{{DATE}}` | Publication date | "March 10, 2026" |
| `{{LEAD_HEADLINE}}` | Main story headline | "Comcast Drops New Gigabit Pricing for Q2" |
| `{{LEAD_BODY}}` | 2-3 sentence summary | "Businesses in my territory can now get symmetrical gigabit for $149/mo..." |
| `{{LEAD_LINK}}` | URL for CTA button | "https://..." or mailto: |
| `{{LEAD_CTA}}` | Button text | "See the pricing" |
| `{{HIT_1_TITLE}}` | Quick hit headline | "New Triple Play Bundle" |
| `{{HIT_1_BODY}}` | 1-sentence description | "Voice + Internet + TV starting at $199" |
| `{{HIT_2_TITLE}}` | Quick hit headline | "Promotion Extended" |
| `{{HIT_2_BODY}}` | 1-sentence description | "Free installation through March 31" |
| `{{HIT_3_TITLE}}` | Quick hit headline | "Territory Update" |
| `{{HIT_3_BODY}}` | 1-sentence description | "Added 3 new buildings in Ruston" |
| `{{OPPORTUNITY_TITLE}}` | Weekly referral ask | "Looking for Restaurant Owners" |
| `{{OPPORTUNITY_BODY}}` | Specific details | "Downtown Tacoma restaurants with 20+ employees..." |
| `{{REFERRAL_TARGET}}` | Ideal referral profile | "Restaurant decision-makers in 98402, 98403" |
| `{{UNSUBSCRIBE_LINK}}` | Unsubscribe URL | SalesLoft unsubscribe |
| `{{WEB_VERSION_LINK}}` | Browser version URL | daequanai.com/comcast/newsletter/issue-001 |

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Navy Deep | `#0A192F` | Headers, primary buttons |
| Navy Light | `#1E3A5F` | Gradient accents |
| Electric Teal | `#00D4AA` | CTAs, highlights, accent bars |
| Blue | `#3B82F6` | Secondary accents |
| Purple | `#8B5CF6` | Tertiary accents |
| Slate 900 | `#0F172A` | Body headings |
| Slate 600 | `#475569` | Body text |
| Slate 400 | `#94A3B8` | Secondary text |
| Slate 100 | `#F1F5F9` | Background |

## Content Guidelines

### Lead Story
- 1 main insight or win per issue
- Keep it personal ("I just learned...", "This week in the field...")
- 40-60 words max
- One clear CTA

### Quick Hits
- 3 items max (decision fatigue)
- Lead with the benefit, not the feature
- One sentence each
- Use color bars to create visual rhythm

### Partner Opportunity
- Be specific about WHO you want
- Include ZIP codes or neighborhoods
- Mention what's in it for them (commission, relationship)

## SalesLoft Upload

1. Copy the rendered HTML (after variable replacement)
2. In SalesLoft: Email → Templates → New Template
3. Paste HTML in "Source" view
4. Test send to yourself
5. Check on mobile (iPhone Mail, Gmail app)

## Web Version

For the "View in browser" link, consider creating a Next.js page at:
`daequanai.com/comcast/newsletter/issue-XXX`

This can be the same HTML but with full-width layout and SEO metadata.
