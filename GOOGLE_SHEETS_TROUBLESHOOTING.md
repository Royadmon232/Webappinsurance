# Google Sheets Integration Troubleshooting

## שגיאה: `error:1E08010C:DECODER routines::unsupported`

השגיאה הזו מציינת בעיה בפענוח המפתח הפרטי של Google Service Account.

### סיבות אפשריות:

1. **המפתח הפרטי לא מוגדר כראוי** ב-Environment Variables
2. **פורמט המפתח שגוי** (חסרים תווי newline או headers)
3. **המפתח מקודד ב-Base64** ולא מפוענח כראוי
4. **בעיה בהרשאות** של Service Account

### פתרונות:

#### 1. בדיקת התצורה הנוכחית

גש לכתובת: `https://your-domain.vercel.app/api/test-sheets-connection`

זה יבדוק את כל ההגדרות ויראה לך איפה הבעיה.

#### 2. תיקון המפתח הפרטי

ב-Vercel Dashboard:
1. לך ל-Settings > Environment Variables
2. מצא את `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
3. ודא שהמפתח מכיל:
   - `-----BEGIN PRIVATE KEY-----`
   - `-----END PRIVATE KEY-----`
   - תוכן המפתח בין השורות

**פורמט נכון:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
(שורות נוספות של המפתח)
...
-----END PRIVATE KEY-----
```

#### 3. אם המפתח מקודד ב-Base64

אם המפתח נראה כמו מחרוזת ארוכה ללא תווי newline:
1. פענח אותו מ-Base64 ל-Text
2. ודא שהוא מכיל את ה-headers הנכונים
3. החלף את המפתח ב-Vercel

#### 4. בדיקת הרשאות Service Account

ב-Google Cloud Console:
1. לך ל-IAM & Admin > Service Accounts
2. מצא את ה-Service Account שלך
3. ודא שיש לו הרשאות:
   - `Google Sheets API`
   - `Google Drive API` (אם נדרש)

#### 5. בדיקת גישה לגיליון

ב-Google Sheets:
1. פתח את הגיליון
2. לחץ על "Share"
3. הוסף את האימייל של Service Account
4. תן הרשאות "Editor"

### בדיקת הקוד החדש

הקוד עודכן עם:
- ✅ טיפול טוב יותר בשגיאות
- ✅ בדיקת פורמט המפתח
- ✅ תמיכה במפתחות מקודדים ב-Base64
- ✅ בדיקת הרשאות לפני שליחת הנתונים
- ✅ הודעות שגיאה מפורטות

### פקודות בדיקה:

```bash
# בדיקת החיבור לגיליון
curl https://your-domain.vercel.app/api/test-sheets-connection

# בדיקת הלוגים
vercel logs --app your-app-name
```

### Environment Variables נדרשים:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----
GOOGLE_SHEETS_ID=your-google-sheets-id
GOOGLE_SHEETS_RANGE=לידים!A:BH
```

### אם עדיין לא עובד:

1. צור Service Account חדש
2. הורד את קובץ ה-JSON
3. העתק את הערכים מהקובץ
4. ודא שהגיליון משותף עם Service Account
5. בדוק שה-Google Sheets API מופעל בפרויקט

### קבלת עזרה:

אם הבעיה נמשכת, הפעל את endpoint הבדיקה והעתק את התוצאות:
`https://your-domain.vercel.app/api/test-sheets-connection` 