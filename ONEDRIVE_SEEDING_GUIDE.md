# 🖼️ OneDrive Image Seeding Guide for NANA Caring Platform

## 📋 Overview
This guide helps you add products with custom images from your OneDrive folder to the NANA Caring Platform database.

**Your OneDrive Folder:** https://1drv.ms/f/c/c29be3c60d57f1f4/EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A?e=zGSjUS

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get OneDrive File IDs
1. **Open your OneDrive folder** in a web browser
2. **For each image file:**
   - Click on the image to select it
   - Click the **"Share"** button (🔗 icon)
   - Click **"Copy link"** 
   - You'll get a URL like: `https://1drv.ms/i/c/c29be3c60d57f1f4/YOUR_FILE_ID?e=ACCESS_KEY`
   - **Extract the `YOUR_FILE_ID` part** (between the last `/` and `?`)

### Step 2: Update the Script
Edit `seed-onedrive-products-final.js` and replace these placeholders:

```javascript
const IMAGE_FILE_IDS = {
  PUZZLE: 'EabcDEF123xyz',        // Replace with your puzzle image file ID
  APPLE: 'EghiJKL456abc',          // Replace with your apple/fruit image file ID
  TABLET: 'EmnoPQR789def',        // Replace with your tablet image file ID  
  VITAMINS: 'EstuVWX012ghi',      // Replace with your vitamins image file ID
  FIRSTAID: 'EyzaBC345jkl',       // Replace with your first aid kit image file ID
  BREAD: 'EdefGHI678mno',         // Replace with your bread image file ID
  BOARDGAME: 'EpqrSTU901vwx',     // Replace with your board games image file ID
  HEADPHONES: 'EyzaBC234xyz',     // Replace with your headphones image file ID
  PRENATAL: 'EdefGH567abc',       // Replace with your prenatal vitamins image file ID
  PILLOW: 'EijkLM890def'          // Replace with your maternity pillow image file ID
};
```

### Step 3: Run the Seeder
```bash
cd "c:\Users\princ\OneDrive\Documents\TOBUN\NANA Project\Backend-"
node seed-onedrive-products-final.js
```

---

## 📁 Files Included

| File | Purpose |
|------|---------|
| `seed-onedrive-products-final.js` | ✅ **Main seeding script** (use this one) |
| `onedrive-helper.js` | Helper tools and URL generators |
| `seed-onedrive-images.js` | Alternative seeding approach |
| `ONEDRIVE_SEEDING_GUIDE.md` | This documentation file |

---

## 🖼️ Product Images Mapping

The script will create these products with your OneDrive images:

| Product | Category | File ID Variable | Your Image Should Show |
|---------|----------|-----------------|----------------------|
| Educational Puzzle Set 500 Pieces | Education | `PUZZLE` | Beautiful country life puzzle (like your attachment) |
| Fresh Organic Red Apples 1kg | Groceries | `APPLE` | Fresh apples or fruits |
| Children's Educational Tablet | Education | `TABLET` | Educational tablet for kids |
| Children's Multivitamin Gummies | Healthcare | `VITAMINS` | Vitamin gummies or supplements |
| Complete Family First Aid Kit | Healthcare | `FIRSTAID` | First aid kit or medical supplies |
| Artisan Whole Grain Bread | Groceries | `BREAD` | Fresh bread or bakery items |
| Family Board Game Collection | Entertainment | `BOARDGAME` | Board games or family games |
| Wireless Bluetooth Headphones | Entertainment | `HEADPHONES` | Headphones or audio equipment |
| Prenatal Vitamin Complex | Pregnancy | `PRENATAL` | Prenatal vitamins or supplements |
| Ergonomic Maternity Pillow | Pregnancy | `PILLOW` | Maternity pillow or comfort items |

---

## 🔗 OneDrive URL Examples

### Input (OneDrive Share URL):
```
https://1drv.ms/i/c/c29be3c60d57f1f4/EabcDEF123xyz?e=AbCdEf
```

### Extract File ID:
```
EabcDEF123xyz
```

### Generated Direct Image URL:
```
https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21EabcDEF123xyz&authkey=!zGSjUS&width=800&height=600
```

---

## ⚙️ Advanced Usage

### Test Individual URLs
```bash
node onedrive-helper.js test "https://onedrive.live.com/embed?resid=..."
```

### Generate URL Templates
```bash
node onedrive-helper.js generate
```

### Check Database After Seeding
```bash
# Connect to database and check products
node check-products.js
```

---

## 🛠️ Troubleshooting

### Problem: "File ID not working"
**Solution:** 
- Make sure you copied the complete file ID
- Check that your OneDrive folder is publicly accessible
- Try using the "Embed" option instead of "Share" in OneDrive

### Problem: "Database connection error"
**Solution:**
- Check your `.env` file has correct database credentials
- Ensure PostgreSQL is running
- Verify network connectivity to database

### Problem: "Products already exist"
**Solution:**
- The script automatically skips existing products (by SKU)
- To re-add products, delete them first or change the SKU values

### Problem: "Images not displaying"
**Solution:**
- Test the generated URLs in a web browser
- Ensure OneDrive folder permissions allow public access
- Check that file IDs are correctly formatted

---

## 📊 Expected Results

After successful seeding, you should see:

```
📊 SEEDING RESULTS:
===================
✅ Successfully added: 10 products
⚠️  Skipped (existing): 0 products
❌ Errors: 0 products
📦 Total active products in database: 51

📋 Products by category:
   Entertainment: 11 products
   Healthcare: 9 products
   Education: 9 products
   Pregnancy: 8 products
   Groceries: 8 products
   Other: 6 products
```

---

## 🔒 Security Notes

- OneDrive URLs include access keys that allow public viewing
- Make sure you're comfortable with images being publicly accessible
- URLs will work as long as your OneDrive folder remains shared
- Consider using dedicated image hosting for production environments

---

## 🎯 Example Complete Workflow

1. **Prepare Images:** Upload 10 product images to your OneDrive folder
2. **Get File IDs:** 
   ```
   Puzzle image: EabcDEF123xyz
   Apple image: EghiJKL456abc
   (... and so on for all 10 images)
   ```
3. **Update Script:**
   ```javascript
   const IMAGE_FILE_IDS = {
     PUZZLE: 'EabcDEF123xyz',
     APPLE: 'EghiJKL456abc',
     // ... update all 10 file IDs
   };
   ```
4. **Run Seeding:**
   ```bash
   node seed-onedrive-products-final.js
   ```
5. **Verify Results:** Check your database or API endpoints

---

## 📞 Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your OneDrive URLs work in a web browser
3. Ensure database connectivity is working
4. Review the troubleshooting section above

---

**Happy Seeding! 🌱✨**

*Your OneDrive images will make the NANA Caring Platform product catalog more visually appealing and personalized.*