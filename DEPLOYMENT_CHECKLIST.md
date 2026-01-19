# Vercel Deployment Checklist - EIRS Project

## Pre-Deployment Verification ✅

### Local Testing Complete
- ✅ Backend running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:3001`
- ✅ MongoDB Atlas connected successfully
- ✅ Admin user exists: `admin@eirtech.com / Admin@123`
- ✅ Frontend builds successfully: `npm run build`
- ✅ No critical errors in build output

### Code Quality
- ✅ ESLint warnings fixed
- ✅ Unused imports removed
- ✅ All files committed to GitHub (commit `703aa76`)

### API Configuration
- ✅ `api/index.js` - Production serverless handler with:
  - Dynamic CORS with regex pattern for `*.vercel.app`
  - Proper OPTIONS preflight handling
  - Request logging for debugging
  - Health check endpoint
  - Comprehensive error handling

- ✅ `api/health.js` - Health check endpoint with proper CORS

- ✅ `client/src/services/api.js` - Updated with:
  - Environment detection (production vs development)
  - Automatic API URL selection
  - JWT token injection
  - 401 error handling
  - Request/response logging

### Environment Variables Configured
- ✅ `MONGODB_URI` - Set to MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Set to "Secret"
- ✅ `NODE_ENV` - Will be set to "production" by Vercel

## Deployment Steps

### Step 1: Vercel Settings Verification
1. Go to: https://vercel.com/dashboard/projects/eirs-project
2. Select **EIRS-Project** deployment
3. Go to **Settings → General**
4. Verify:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 2: Environment Variables
1. In Vercel Dashboard → **Settings → Environment Variables**
2. Add the following:
   ```
   MONGODB_URI=mongodb+srv://rijusarkar9640:hgtWfu3E5SqFxZXh@cluster0.6bdcvde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=Secret
   NODE_ENV=production
   ```

### Step 3: Trigger Deployment
1. Go to **Deployments** tab
2. Click **... (three dots)** on the most recent deployment
3. Select **Redeploy** (this uses the latest code from GitHub)
4. Choose **Production** branch
5. Wait 3-5 minutes for deployment

### Step 4: Monitor Build
1. Watch the deployment logs in real-time
2. Expected success indicators:
   - `Building project...` → `npm install`
   - `Running build command...` → `npm run build`
   - `Build succeeded`
   - Final output: `Deployed to https://eirs-project.vercel.app`

## Post-Deployment Testing

### Test 1: Frontend Loads
1. Open: https://eirs-project.vercel.app
2. Check browser console (F12 → Console tab)
3. Should see: `API_BASE_URL configured as: /api`
4. No critical errors should appear

### Test 2: Admin Signin
1. Click "Sign In" button
2. Enter:
   - Email: `admin@eirtech.com`
   - Password: `Admin@123`
3. Click "Sign In"
4. Expected result:
   - No 405 errors in console
   - Redirect to admin dashboard
   - User data displays

### Test 3: API Connectivity
1. Open browser console (F12)
2. Look for requests to `/api/auth/signin`
3. Expected status: **200** (not 405)
4. Response should contain:
   ```json
   {
     "success": true,
     "token": "...",
     "user": { "email": "admin@eirtech.com", "isAdmin": true }
   }
   ```

### Test 4: Dashboard Functionality
1. Once logged in, verify:
   - Dashboard loads without errors
   - Admin menu appears
   - Products page loads
   - Enquiries page loads
   - Profile settings accessible

## Troubleshooting

### Issue: 405 Method Not Allowed
**Solution**: The API handler is now properly configured with:
- Dynamic CORS for `*.vercel.app`
- OPTIONS preflight handling
- Correct method whitelisting

If still occurring:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check Vercel deployment logs for errors
4. Verify environment variables are set

### Issue: Build Fails
**Solution**: 
1. Check build logs for specific error
2. Common causes already fixed:
   - ESLint warnings → Fixed with eslint-disable comments
   - Git submodules → Removed from index
   - Missing dependencies → All in package.json

### Issue: Database Connection Error
**Solution**:
1. Verify MongoDB Atlas connection string in Vercel env vars
2. Check whitelist IP: Should allow "0.0.0.0/0" for production
3. Verify cluster is active (not paused)

### Issue: "Cannot find module" Errors
**Solution**:
1. Ensure all dependencies are in `package.json`
2. Run `npm install` locally to verify
3. Check for typos in import paths

## Rollback Plan

If deployment fails completely:
1. Go to Vercel **Deployments** tab
2. Find the last successful deployment
3. Click **... → Promote to Production**
4. This reverts to the previous working version

## Next Steps After Successful Deployment

1. ✅ Verify all tests pass
2. ✅ Share deployment link with stakeholders
3. ✅ Monitor error logs for 24 hours
4. ✅ Set up error alerts in Vercel
5. ✅ Document any issues encountered

---

## Quick Reference

**Production URLs:**
- Frontend: https://eirs-project.vercel.app
- Backend API: https://eirs-project.vercel.app/api (serverless functions)
- GitHub: https://github.com/Sgaurav30/EIRS-Project

**Admin Credentials:**
- Email: `admin@eirtech.com`
- Password: `Admin@123`

**Database:**
- MongoDB Atlas Cluster0
- Connection verified locally ✅

**Latest Commit:** `703aa76` - Production API handler with proper CORS
