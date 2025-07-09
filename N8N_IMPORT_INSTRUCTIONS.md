# הוראות להגדרת n8n לשליחת קודי אימות

## שלב 1: יבוא ה-Workflow

1. פתח את n8n שלך
2. לחץ על **"Import from File"** או **"Import Workflow"**
3. העלה את הקובץ `n8n-workflow-example.json`
4. ה-workflow ייפתח אוטומטית

## שלב 2: הגדרת AWS Credentials

### יצירת Credential חדש:
1. לך ל-**Settings → Credentials**
2. לחץ על **"Add Credential"**
3. חפש **"AWS"**
4. מלא את הפרטים:
   - **Credential Name**: `AWS SES`
   - **Region**: `eu-north-1` (או האזור שלך)
   - **Access Key ID**: `<מה-AWS שלך>`
   - **Secret Access Key**: `<מה-AWS שלך>`
5. לחץ **Save**

### חיבור ה-Credential ל-workflow:
1. חזור ל-workflow
2. לחץ פעמיים על הנוד **"Send Email via SES"**
3. ב-Credential, בחר את **"AWS SES"** שיצרת
4. לחץ **Save**

## שלב 3: קבלת ה-Webhook URL

1. לחץ פעמיים על הנוד **"Webhook"**
2. תראה את ה-URL בפורמט:
   ```
   https://your-n8n-instance.com/webhook/send-verification-email
   ```
3. **העתק את ה-URL הזה** - תצטרך אותו ל-Vercel

## שלב 4: הגדרת משתנה הסביבה ב-Vercel

1. לך ל-[Vercel Dashboard](https://vercel.com)
2. בחר את הפרויקט שלך
3. לך ל-**Settings → Environment Variables**
4. הוסף משתנה חדש:
   - **Key**: `N8N_WEBHOOK_URL`
   - **Value**: `<ה-URL מהשלב הקודם>`
   - **Environment**: בחר את כל הסביבות
5. לחץ **Save**

## שלב 5: הפעלת ה-Workflow

1. חזור ל-n8n
2. בפינה הימנית העליונה, העבר את המתג ל-**Active**
3. ה-workflow כעת פעיל ומוכן לקבל בקשות

## שלב 6: בדיקת המערכת

### בדיקה מ-n8n:
1. לחץ על **"Execute Workflow"**
2. בנוד הראשון (Webhook), לחץ על **"Test"**
3. שלח את הנתונים הבאים:
   ```json
   {
     "email": "test@example.com",
     "code": "123456",
     "subject": "קוד אימות - בדיקה",
     "htmlContent": "<h1>קוד האימות שלך: 123456</h1>"
   }
   ```
4. בדוק שכל הנודים רצו בהצלחה (ירוק)

### בדיקה מהאתר:
1. פתח את האתר שלך
2. לחץ על **"קבל הצעת מחיר"**
3. מלא את כל הפרטים
4. בשלב האחרון, הזן את המייל שלך
5. לחץ על **"קבל קוד אימות"**
6. בדוק את תיבת המייל שלך

## בעיות נפוצות ופתרונות

### "N8N webhook URL is missing"
- וודא שהגדרת את `N8N_WEBHOOK_URL` ב-Vercel
- בדוק שה-deployment החדש רץ אחרי הוספת המשתנה

### "Failed to send email"
- בדוק שה-AWS credentials נכונים
- וודא שהכתובת/דומיין מאומתים ב-Amazon SES
- בדוק שאתה לא ב-Sandbox mode ב-SES

### ה-Webhook לא מקבל בקשות
- וודא שה-workflow במצב **Active**
- בדוק שה-URL ב-Vercel זהה ל-URL ב-n8n
- נסה להפעיל מחדש את ה-workflow

## טיפים חשובים

1. **תמיד בדוק ב-Executions**: 
   - לך ל-**Executions** ב-n8n לראות היסטוריה
   - שם תראה אם היו שגיאות ומה הן

2. **הגדר Production webhook**:
   - ב-production, השתמש ב-Production URL
   - אל תשתמש ב-Test URL

3. **מעקב אחר מיילים**:
   - בדוק ב-Amazon SES את הסטטיסטיקות
   - עקוב אחר bounces ו-complaints

## מבנה הנתונים המצופה

הקוד שלך שולח ל-n8n את הנתונים הבאים:

```json
{
  "action": "send_verification_email",
  "email": "customer@example.com",
  "code": "123456",
  "subject": "קוד אימות - אדמון סוכנות לביטוח",
  "htmlContent": "<!-- HTML של המייל -->",
  "timestamp": "2025-01-08T17:00:00.000Z"
}
```

וה-n8n מחזיר:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "0100018ed9f6a9b8-..."
}
``` 