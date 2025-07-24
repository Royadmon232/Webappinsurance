# בדיקת מערכת אימות MongoDB
## Verification System Test Instructions

### 🔧 הגדרות שהושלמו

✅ **שינויים בקוד**:
- `api/verification-storage.js` - מעבר ל-MongoDB
- `api/send-email-verification.js` - פונקציות אסינכרוניות  
- `api/verify-code.js` - פונקציות אסינכרוניות

✅ **משתנה סביבה**:
- `MONGODB_URI` מוגדר ב-Vercel Environment Variables

✅ **API endpoint לבדיקה**:
- `api/test-mongodb.js` - בדיקת חיבור MongoDB

### 🧪 איך לבדוק שהכל עובד

#### 1. בדיקת חיבור MongoDB
```bash
# פתח בדפדפן או השתמש ב-curl:
https://admon-insurance-agency.co.il/api/test-mongodb
```

**תוצאה מצופה**:
```json
{
  "timestamp": "2025-01-20T...",
  "mongoUriConfigured": true,
  "connectionSuccess": true,
  "databaseAccess": true,
  "collectionAccess": true,
  "writeTest": true,
  "readTest": true,
  "indexCreation": true,
  "error": null,
  "details": [
    "✅ MongoDB URI is configured",
    "✅ Successfully connected to MongoDB",
    "✅ Database access successful",
    "🎉 All MongoDB tests completed successfully!"
  ]
}
```

#### 2. בדיקת מערכת אימות מלאה

**שלב A: שליחת קוד אימות**
```bash
curl -X POST https://admon-insurance-agency.co.il/api/send-email-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**שלב B: אימות קוד**
```bash
# השתמש בקוד שקיבלת למייל
curl -X POST https://admon-insurance-agency.co.il/api/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### 🐛 פתרון בעיות

#### אם בדיקת MongoDB נכשלת:

1. **בדוק Vercel Environment Variables**:
   - לך ל-Vercel Dashboard → Settings → Environment Variables
   - וודא ש-`MONGODB_URI` מוגדר נכון

2. **בדוק את הלוגים**:
   - Vercel Dashboard → Functions → View Function Logs

3. **בדוק MongoDB Atlas**:
   - IP Whitelist: `0.0.0.0/0` 
   - Username/Password נכונים
   - Cluster פעיל

#### שגיאות נפוצות:

- **"Page could not be found"**: הdeployment עדיין לא הושלם (חכה 2-3 דקות)
- **"Authentication failed"**: בעיה ב-username/password ב-MongoDB URI
- **"Connection timeout"**: בעיה ברשת או IP allowlist

### ✅ סימנים שהכל עובד

1. **API test-mongodb מחזיר JSON עם `"connectionSuccess": true`**
2. **שליחת קוד אימות מחזירה הצלחה** 
3. **אימות הקוד עובד כמו שצריך**
4. **אין עוד שגיאות בלוגים על "Total stored codes: 0"**

### 🎯 התוצאה הסופית

מערכת האימות עכשיו עובדת עם MongoDB מרכזי:
- ✅ קודים נשמרים בין serverless functions
- ✅ אימות עובד בצורה אמינה
- ✅ ניקוי אוטומטי של קודים פגי תוקף
- ✅ מעקב ודיבוג משופרים

---

**הערה**: אם יש עדיין בעיות, שלח screenshot של התוצאה מ-`/api/test-mongodb` 