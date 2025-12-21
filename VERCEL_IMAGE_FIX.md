# 🖼️ Vercel Image Deployment Fix Guide

## Issues Fixed

### 1. Case Sensitivity
- **Problem**: `Logo.png` (capital L) was referenced as `logo.png` (lowercase) in code
- **Fix**: Updated all references to use correct case: `Logo.png`
- **Files Updated**:
  - `src/pages/registration/LoginPage.js`
  - `src/pages/registration/RegisterPage.js`

### 2. Thai Filename Encoding
- **Problem**: Thai characters in filenames (`แก้วมังกร.jpg`) might not be properly encoded
- **Fix**: Added `getImagePath()` utility function to handle encoding
- **File**: `src/utils/imageUtils.js`

### 3. Next.js Configuration
- **Problem**: Static assets might not be properly configured
- **Fix**: Updated `next.config.mjs` with proper static file serving configuration

## Verification Checklist

After deploying, verify:

1. ✅ **Logo images load** on login/register pages
2. ✅ **Promotional banners** display correctly (`promotion1.png`, `promotion2.png`, `promotion3.png`)
3. ✅ **Product images** load (including Thai filename `แก้วมังกร.jpg`)
4. ✅ **Fallback images** work (`example.jpg`)

## Testing Locally Before Deploy

```bash
# Build the project
npm run build

# Test the production build locally
npm start

# Check browser console for any 404 errors on images
```

## Common Issues & Solutions

### Images Still Not Loading?

1. **Check file names match exactly** (case-sensitive):
   ```bash
   ls -la public/images/
   ```

2. **Verify files are committed to Git**:
   ```bash
   git ls-files public/images/
   ```

3. **Check Vercel build logs** for any errors during deployment

4. **Verify file paths in code** match actual filenames:
   - `Logo.png` (capital L) ✅
   - `logo.png` (lowercase) ❌

### Thai Characters Not Working?

If Thai filenames still don't work, consider renaming files to use English/Latin characters:
- `แก้วมังกร.jpg` → `dragon-fruit.jpg`

Then update references in code accordingly.

## Files Changed

1. `next.config.mjs` - Added static asset configuration
2. `src/utils/imageUtils.js` - Added `getImagePath()` utility
3. `src/pages/index.js` - Updated to use `getImagePath()` utility
4. `src/pages/registration/LoginPage.js` - Fixed Logo.png case
5. `src/pages/registration/RegisterPage.js` - Fixed Logo.png case

## Next Steps

1. Commit all changes
2. Push to your repository
3. Redeploy on Vercel
4. Test all image paths in production

---

**Note**: If images still don't load after these fixes, check:
- Vercel build logs for errors
- Browser console for 404 errors
- Network tab to see which files are failing to load

