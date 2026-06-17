# Cloudflare Tunnel Setup for CRM Reports

## Goal
Make `https://crm.daequanai.com` and `https://reports.daequanai.com` accessible from anywhere.

## Prerequisites
- Cloudflared installed (`brew install cloudflared`)
- Access to Cloudflare dashboard for daequanai.com

## Setup Steps

### 1. Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
This opens a browser. Select the daequanai.com zone and authorize.

### 2. Create the tunnel
```bash
cloudflared tunnel create crm-daequanai
```
Note the tunnel ID that gets printed (looks like a UUID).

### 3. Create DNS records
```bash
cloudflared tunnel route dns crm-daequanai crm.daequanai.com
cloudflared tunnel route dns crm-daequanai reports.daequanai.com
```

### 4. Update config file
Edit `~/.cloudflared/config.yml` and replace `TUNNEL_ID_PLACEHOLDER` with your actual tunnel ID.

### 5. Test the tunnel
```bash
cloudflared tunnel run crm-daequanai
```

### 6. Set up as service (optional)
```bash
sudo cloudflared service install
```

## Verification
Once running, these URLs should work:
- `https://crm.daequanai.com/reports`
- `https://reports.daequanai.com`

## Troubleshooting
- Check tunnel status: `cloudflared tunnel list`
- View logs: `cloudflared tunnel tail crm-daequanai`
- Restart: `cloudflared tunnel run crm-daequanai`
