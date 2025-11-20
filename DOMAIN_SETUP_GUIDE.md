# PulseOfProject.com Domain Setup Guide

## Current Status
- ✅ Domain registered: pulseofproject.com (via Namecheap)
- ✅ Vercel project deployed: pulse-of-project
- ⏳ DNS configuration needed

## Setup Instructions (Using Namecheap DNS)

### Step 1: Update DNS Records in Namecheap

You need to update the DNS records as shown in your Namecheap dashboard:

#### 1. Update the A Record:
- **Type**: A Record
- **Host**: @
- **Value**: `76.76.21.21` (Vercel's IP)
- **TTL**: Automatic
- Click **EDIT** on the existing A record and change from `216.150.1.1` to `76.76.21.21`

#### 2. Update the CNAME Record:
- **Type**: CNAME Record
- **Host**: www
- **Value**: `cname.vercel-dns.com`
- **TTL**: Automatic
- Click **EDIT** on the existing CNAME record and change from `10813aa501d86cc3.vercel-dns-016.com` to `cname.vercel-dns.com`

### Step 2: Verify in Vercel Dashboard

1. Go to https://vercel.com/chatgptnotes-6366s-projects/pulse-of-project/settings/domains
2. Click "Add Domain"
3. Enter: `pulseofproject.com`
4. Vercel will verify the DNS records

### Step 3: Wait for DNS Propagation

- DNS changes can take 5-48 hours to propagate globally
- Usually works within 30 minutes

## Alternative: Use Vercel DNS (Full Control)

If you want Vercel to manage everything:

### In Namecheap:
1. Go to Domain List → Manage → Nameservers
2. Select "Custom DNS"
3. Add:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. Save changes

### In Vercel:
The domain will automatically configure once nameservers are updated.

## Verification Steps

After DNS updates, check:

```bash
# Check A record
dig pulseofproject.com

# Check CNAME record
dig www.pulseofproject.com

# Or use online tool
https://dnschecker.org/#A/pulseofproject.com
```

## Expected Result

Once configured correctly:
- https://pulseofproject.com → Your PulseOfProject landing page
- https://www.pulseofproject.com → Your PulseOfProject landing page
- https://pulseofproject.com/pulse → Dashboard
- https://pulseofproject.com/pulse?client=true → Client portal

## Troubleshooting

### If you see "404: NOT_FOUND"
- DNS records are correct but Vercel hasn't linked the domain
- Go to Vercel dashboard and add the domain to your project

### If you see Namecheap parking page
- DNS hasn't propagated yet
- Wait 30 minutes and try again

### SSL Certificate
- Vercel automatically provisions SSL certificates
- This happens after DNS verification (usually within minutes)

## Current DNS Records (To Fix)

❌ **Current A Record**: 216.150.1.1 (Namecheap parking)
✅ **Should be**: 76.76.21.21 (Vercel)

❌ **Current CNAME**: 10813aa501d86cc3.vercel-dns-016.com (Old Vercel)
✅ **Should be**: cname.vercel-dns.com (Vercel CNAME)

---

## Quick Actions

1. **In Namecheap**: Click "EDIT" next to the A record → Change to `76.76.21.21` → Save
2. **In Namecheap**: Click "EDIT" next to CNAME record → Change to `cname.vercel-dns.com` → Save
3. **In Vercel**: Add domain `pulseofproject.com` to your project
4. **Wait**: 30 minutes for DNS propagation
5. **Test**: Visit https://pulseofproject.com

---

Last Updated: October 24, 2024
Status: Awaiting DNS configuration in Namecheap