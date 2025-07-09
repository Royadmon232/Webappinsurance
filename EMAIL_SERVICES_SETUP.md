# Email Services Setup Guide

המערכת תומכת בשני שירותי אימייל במקביל:

## שירותי האימייל

### 1. Amazon SES (Simple Email Service)
**מטרה**: שליחת קוד אימות ללקוח
**כיוון**: מהמערכת ללקוח

### 2. Gmail API
**מטרה**: שליחת התראה לסוכן על קוד אימות ששולח
**כיוון**: מהמערכת לסוכן

### 3. N8N Webhook (אופציונלי)
**מטרה**: אוטומציה נוספת ו-workflow management
**כיוון**: מהמערכת לN8N

## הגדרת Amazon SES

1. **צור AWS Account** אם אין לך
2. **הפעל Amazon SES**:
   - לך ל-AWS Console > SES
   - אמת את הדומיין או כתובת האימייל שלך
   - קבל את ה-Access Key ו-Secret Key

3. **הגדר Environment Variables**:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=eu-north-1
   ```

## הגדרת Gmail API

1. **צור Google Cloud Project**
2. **הפעל Gmail API**
3. **צור OAuth 2.0 Credentials**
4. **קבל Refresh Token**

5. **הגדר Environment Variables**:
   ```
   GMAIL_CLIENT_ID=your_gmail_client_id
   GMAIL_CLIENT_SECRET=your_gmail_client_secret
   GMAIL_REDIRECT_URI=your_gmail_redirect_uri
   GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
   ```

## הגדרת N8N Webhook (אופציונלי)

1. **הגדר N8N Instance**
2. **צור Webhook**
3. **הגדר Environment Variable**:
   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ```

## תהליך העבודה

כאשר לקוח מבקש קוד אימות:

1. **Amazon SES** שולח קוד אימות ללקוח עם עיצוב מלא
2. **Gmail API** שולח התראה לסוכן עם פרטי הקוד
3. **N8N Webhook** מקבל נתונים לאוטומציה נוספת

## בדיקת התקנה

אם הכל מוגדר נכון, תראה בלוגים:
```
Email verification completed. Success: SES=true, N8N=true, Agent=true
```

## פתרון בעיות

### שגיאת 500 
- בדוק שכל ה-Environment Variables מוגדרים
- בדוק שAWS SES אומת ופעיל
- בדוק שGmail API מוגדר נכון

### רק חלק מהשירותים עובד
המערכת תמשיך לעבוד גם אם חלק מהשירותים נכשלים. לכל שירות יש fallback.

### לוגים
תמיד בדוק את הלוגים בVercel Functions כדי לראות מה קורה:
- Amazon SES errors
- Gmail API errors  
- N8N webhook errors 