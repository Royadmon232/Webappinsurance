# הגדרת מערכת אימות MongoDB
## MongoDB Verification System Setup

### בעיה שנפתרה
הבעיה הייתה שקודי האימות נשמרו רק בזיכרון מקומי של כל serverless function ב-Vercel, מה שגרם לכך שקוד שנשלח במכונה אחת לא היה זמין לאימות במכונה אחרת.

### הפתרון
עברנו לשימוש ב-MongoDB כמסד נתונים מרכזי לשמירת קודי האימות.

### הגדרה נדרשת

#### 1. משתנה סביבה ב-Vercel
הוסף את משתנה הסביבה הבא ב-Vercel Dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/insurance_app?retryWrites=true&w=majority
```

**איך להוסיף ב-Vercel:**
1. כנס ל-Vercel Dashboard
2. בחר את הפרויקט שלך
3. לך ל-Settings → Environment Variables
4. הוסף משתנה חדש:
   - Name: `MONGODB_URI`
   - Value: connection string של MongoDB שלך
   - Environments: Production, Preview, Development

#### 2. הגדרת MongoDB

**אפשרות 1: MongoDB Atlas (מומלץ)**
1. כנס ל-[MongoDB Atlas](https://cloud.mongodb.com)
2. צור cluster חדש או השתמש בקיים
3. צור database בשם `insurance_app`
4. קבל את connection string
5. הוסף את ה-IP של Vercel ל-IP Whitelist (או השתמש ב-0.0.0.0/0 עבור כל IP)

**אפשרות 2: MongoDB מקומי (לפיתוח)**
```
MONGODB_URI=mongodb://localhost:27017/insurance_app
```

#### 3. בדיקת החיבור

רוץ את הבדיקות הבאות כדי לוודא שהכל עובד:

```bash
# בדיקת חיבור ל-MongoDB
node test-mongodb-connection.js

# בדיקת מערכת האימות המלאה
node test-verification-system.js
```

### שינויים שבוצעו

#### קבצים שהשתנו:
1. **`api/verification-storage.js`** - הוחלף לחלוטין לשימוש ב-MongoDB
2. **`api/send-email-verification.js`** - עודכן לפונקציות אסינכרוניות
3. **`api/verify-code.js`** - עודכן לפונקציות אסינכרוניות

#### תכונות חדשות:
- **TTL Index**: קודים מתפוגגים אוטומטית אחרי 10 דקות
- **שיתוף בין מכונות**: כל קוד זמין בכל serverless function
- **דיבוג משופר**: מידע מפורט על מצב המסד
- **שחזור שגיאות**: חיבור אוטומטי וניסיונות חוזרים

### איך זה עובד

1. **שליחת קוד**: נשמר ב-MongoDB עם תוקף של 10 דקות
2. **אימות קוד**: נשלף מ-MongoDB ומתבצע השוואה
3. **ניקוי אוטומטי**: MongoDB מוחק קודים פגי תוקף אוטומטיות

### בדיקה ופתרון בעיות

#### אם עדיין יש בעיות:

1. **בדוק את הלוגים ב-Vercel**:
   - לך ל-Vercel Dashboard → פרויקט → Functions → בחר function → View Function Logs

2. **בדוק את משתנה הסביבה**:
   ```javascript
   console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
   ```

3. **בדוק חיבור ל-MongoDB**:
   ```bash
   node test-mongodb-connection.js
   ```

#### שגיאות נפוצות:

- **"MONGODB_URI environment variable is not set"**: הוסף את משתנה הסביבה ב-Vercel
- **"MongoServerError: Authentication failed"**: בדוק username/password ב-connection string
- **"Connection timeout"**: בדוק IP whitelist ב-MongoDB Atlas

### יתרונות המערכת החדשה

✅ **אמינות**: קודים לא נעלמים בין serverless functions  
✅ **ביצועים**: חיבור יעיל עם connection pooling  
✅ **אבטחה**: קודים מתפוגגים אוטומטיות  
✅ **מדדים**: מעקב מפורט אחר שימוש  
✅ **גמישות**: ניתן להרחיב למערכות אימות נוספות  

---

**לתמיכה**: אם יש בעיות, בדוק את הלוגים ושלח את השגיאה המדויקת. 