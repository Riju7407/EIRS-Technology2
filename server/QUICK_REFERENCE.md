# EIRS Frontend - Quick Reference Guide

## Quick Start (30 seconds)

```bash
cd client
npm install
npm start
```

Open http://localhost:3000 in your browser.

## What's Ready to Use

### Pages
| Page | URL | Status | Features |
|------|-----|--------|----------|
| Home | `/` | ✅ Ready | Hero, categories, services, footer |
| Products | `/products` | ✅ Ready | Search, filter, grid view |
| Product Detail | `/products/:id` | ✅ Ready | Specs, datasheet, related products |
| Contact | `/contact` | ✅ Ready | Form, map, info cards |
| Sign Up | `/signup` | ✅ Ready | Registration form |
| Sign In | `/signin` | ✅ Ready | Login form |
| Admin Dashboard | `/admin/dashboard` | ✅ Ready | KPIs, overview |
| Admin Enquiries | `/admin/enquiries` | ✅ Ready | CRUD, CSV export |
| Admin Products | `/admin/products` | ✅ Ready | CRUD operations |

## Components Structure

```
Header (Navigation)
    ├── Top Bar (Contact info)
    ├── Sticky Header (Logo, nav, CTA)
    └── Mobile Menu

Footer
    ├── Company Info
    ├── Quick Links
    ├── Contact
    └── Social Links
```

## API Integration Status

### ✅ Fully Integrated
- User Authentication (signup, signin, logout)
- Product Management (CRUD)
- Service Management (CRUD)
- Contact Form Submission
- Admin Features (enquiries, users)

## Key Folders

| Folder | Contents |
|--------|----------|
| `src/components/` | Header, Footer |
| `src/pages/` | All page components |
| `src/services/` | API service layer |
| `src/styles/` | All CSS files |

## Important Files

| File | Purpose |
|------|---------|
| `src/App.js` | Main routing setup |
| `src/services/api.js` | All API calls |
| `src/index.js` | React entry point |

## Features Checklist

- ✅ Responsive Design
- ✅ Mobile Menu
- ✅ Product Search
- ✅ Product Filtering
- ✅ User Authentication
- ✅ Admin Dashboard
- ✅ CRUD Operations
- ✅ Form Validation
- ✅ Error Handling
- ✅ CSV Export
- ✅ Modern UI
- ✅ Smooth Animations

## Customization Guide

### Change API URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'YOUR_API_URL';
```

### Change Colors
Edit `src/styles/global.css`:
```css
--primary-color: #YourColor;
--accent-color: #YourColor;
```

### Add New Page
1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Create CSS file in `src/styles/`
4. Import CSS in `src/App.css`

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy To
- Vercel: `vercel`
- Netlify: Drag & drop `build/` folder
- GitHub Pages: Follow GitHub Pages guide
- Traditional Server: Copy `build/` contents

## Testing Checklist

- [ ] Run `npm start`
- [ ] Navigate all pages
- [ ] Test mobile responsiveness
- [ ] Test forms
- [ ] Test admin features (if logged in)
- [ ] Test filters and search
- [ ] Verify styles load
- [ ] Check console for errors

## Common Commands

```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build

# Run tests
npm test

# Clean install
rm -rf node_modules
npm install
```

## Browser DevTools Tips

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. Check requests

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors

### Check Storage
1. Open DevTools (F12)
2. Application tab
3. Local Storage
4. Check 'token' key

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| "Cannot connect to API" | Ensure backend running on :3000 |
| "Blank page" | Clear cache, restart npm start |
| "Styles missing" | Check CSS imports in App.css |
| "Login not working" | Check localStorage for token |
| "Forms not submitting" | Check backend running, verify API URL |

## File Sizes

| Type | Count |
|------|-------|
| Pages | 9 |
| Components | 2 |
| CSS Files | 10 |
| Service Files | 1 |
| Total Components | 12 |

## Performance Metrics

- ✅ Optimized CSS Grid layouts
- ✅ Responsive images
- ✅ CSS animations (GPU accelerated)
- ✅ Efficient state management
- ✅ Code splitting ready

## Security Features

- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ CORS Enabled
- ✅ Form Validation
- ✅ Error Boundary

## Mobile Optimization

- ✅ Responsive Grid
- ✅ Mobile Menu (Hamburger)
- ✅ Touch-friendly Buttons
- ✅ Optimized Typography
- ✅ Mobile-first CSS

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

## Next Steps

1. ✅ Review SETUP_GUIDE.md
2. ✅ Review PROJECT_COMPLETION_SUMMARY.md
3. Run `npm start`
4. Test all features
5. Customize branding
6. Deploy to production

## Support Resources

- **Frontend Docs**: FRONTEND_README.md
- **Setup Guide**: SETUP_GUIDE.md
- **Completion Summary**: PROJECT_COMPLETION_SUMMARY.md
- **API Documentation**: Check backend README

## Contact Information

For issues or questions:
1. Check console errors (F12)
2. Review API calls in Network tab
3. Verify backend is running
4. Check configuration files

---

**Everything is ready to use!** 🚀

Start with: `npm start`
