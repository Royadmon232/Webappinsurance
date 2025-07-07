# Google Sheets Integration Setup Guide

## הגדרת אינטגרציה עם Google Sheets לשמירת לידים

### סקירה כללית
המערכת שולחת אוטומטית כל ליד שמתקבל מטופס ביטוח הדירה ל-Google Sheets בנוסף למייל שנשלח לסוכן.

## שלב 1: יצירת Google Sheets חדש

1. היכנסו ל-Google Sheets: https://sheets.google.com
2. צרו גיליון חדש בשם "לידים ביטוח דירה"
3. שנו את שם הגיליון הראשון ל-"לידים"

## שלב 2: הוספת הכותרות לגיליון

העתיקו את הכותרות הבאות לשורה הראשונה (A1:BH1):

```
תאריך | שעה | שם פרטי | שם משפחה | ת.ז. | טלפון | אימייל | תאריך התחלת ביטוח | סוג מוצר | סוג נכס | עיר | רחוב | מספר בית | מיקוד | מספר קומות | יש גינה | בנק משעבד | סניף בנק | סכום ביטוח מבנה | גיל המבנה | שטח מבנה | סוג בניה | סטנדרט בניה | משועבד/מוטב | תאריך סיום ההלוואה האחרונה | יש מרפסת | שטח מרפסת | יש גינה (מבנה) | שטח גינה | סוג גג | יש בריכת שחיה | שווי בריכת שחיה | כיסוי נזקי צנרת | השתתפות עצמית נזקי מים | פריצה למבנה | כיסוי רעידת אדמה | כיסוי שווי קרקע ברעידת אדמה | סכום כיסוי רעידת אדמה | שווי תכולה | גיל מבנה (תכולה) | יש תכשיטים | סכום תכשיטים | יש שעונים | סכום שעונים | סכום מצלמות | סכום ציוד אלקטרוני | סכום אופניים | סכום כלי נגינה | כיסוי רעידת אדמה לתכולה | צד שלישי | חבות מעבידים | סייבר למשפחה | טרור | ביטוח רכוש משותף נוסף | ביטוח תכולת המבנה | ביטוח מחסן | ביטוח בריכת שחיה | נזקי מים למשכנתא
```

או הריצו את הסקריפט `google-sheets-template.js` כדי לקבל את רשימת הכותרות המלאה.

## שלב 3: יצירת Service Account ב-Google Cloud

1. היכנסו ל-Google Cloud Console: https://console.cloud.google.com
2. צרו פרויקט חדש או בחרו פרויקט קיים
3. הפעילו את Google Sheets API:
   - לכו ל-"APIs & Services" > "Library"
   - חפשו "Google Sheets API"
   - לחצו על "Enable"

4. צרו Service Account:
   - לכו ל-"APIs & Services" > "Credentials"
   - לחצו על "Create Credentials" > "Service Account"
   - תנו שם: "sheets-writer"
   - לחצו "Create and Continue"
   - בחרו את ה-Role: "Editor" או "Sheets Editor"
   - לחצו "Done"

5. צרו מפתח ל-Service Account:
   - לחצו על ה-Service Account שיצרתם
   - לכו ללשונית "Keys"
   - לחצו "Add Key" > "Create New Key"
   - בחרו "JSON"
   - שמרו את הקובץ - תצטרכו אותו בהמשך

## שלב 4: שיתוף הגיליון עם Service Account

1. פתחו את קובץ ה-JSON שהורדתם
2. חפשו את השדה `client_email` (נראה כמו: your-service-account@your-project.iam.gserviceaccount.com)
3. חזרו ל-Google Sheets שיצרתם
4. לחצו על "Share" (שתף)
5. הכניסו את כתובת ה-email של ה-Service Account
6. תנו הרשאות "Editor"
7. לחצו "Send"

## שלב 5: הגדרת משתני סביבה ב-Vercel

1. היכנסו ל-Vercel Dashboard
2. בחרו את הפרויקט שלכם
3. לכו ל-Settings > Environment Variables
4. הוסיפו את המשתנים הבאים:

```bash
# Service Account Email (מתוך קובץ ה-JSON)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Private Key (מתוך קובץ ה-JSON) - העתיקו את כל התוכן כולל BEGIN/END
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# Google Sheets ID - ניתן למצוא ב-URL של הגיליון
# https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]/edit
GOOGLE_SHEETS_ID=your-sheet-id-here

# טווח לכתיבה (אופציונלי - ברירת מחדל: לידים!A:BH)
GOOGLE_SHEETS_RANGE=לידים!A:BH
```

## שלב 6: בדיקת האינטגרציה

1. פרסמו מחדש את האתר ב-Vercel (Deploy)
2. מלאו טופס ביטוח דירה באתר
3. בדקו ש:
   - המייל נשלח לסוכן
   - שורה חדשה נוספה ל-Google Sheets
   - כל השדות שמולאו מופיעים בעמודות המתאימות

## מבנה הנתונים ב-Google Sheets

הטבלה מכילה 60 עמודות המכסות את כל השדות האפשריים:
- **עמודות A-B**: תאריך ושעה של קבלת הליד
- **עמודות C-H**: פרטים אישיים
- **עמודה I**: סוג מוצר
- **עמודות J-Q**: פרטי נכס וכתובת
- **עמודות R-S**: בנק משעבד (אם רלוונטי)
- **עמודות T-AK**: ביטוח מבנה וכיסויים
- **עמודות AL-AV**: ביטוח תכולה
- **עמודות AW-AZ**: כיסויים נוספים
- **עמודות BA-BE**: הרחבות נוספות

## טיפול בשגיאות

- אם הליד לא נשמר ב-Google Sheets, המערכת תמשיך לעבוד ותשלח את המייל
- שגיאות Google Sheets נרשמות בלוג אבל לא עוצרות את התהליך
- ההודעה למשתמש תציין האם הליד נשמר ב-Google Sheets

## עצות

1. **גיבוי**: Google Sheets שומר היסטוריית גרסאות אוטומטית
2. **אוטומציה**: ניתן להוסיף Google Apps Script לעיבוד נוסף של הנתונים
3. **דוחות**: ניתן ליצור דוחות ו-dashboards מהנתונים ב-Google Sheets
4. **התראות**: ניתן להגדיר התראות על לידים חדשים דרך Google Sheets

## בעיות נפוצות

### הליד לא נשמר ב-Google Sheets
- וודאו שה-Service Account יש הרשאות עריכה לגיליון
- בדקו שה-GOOGLE_SHEETS_ID נכון
- וודאו שכל משתני הסביבה הוגדרו נכון ב-Vercel

### שגיאת Authentication
- בדקו שה-Private Key הועתק נכון כולל \n
- וודאו שה-Service Account Email נכון

### העמודות לא מתאימות
- וודאו שהכותרות בשורה הראשונה תואמות למבנה
- השתמשו בטווח הנכון (לידים!A:BH) 