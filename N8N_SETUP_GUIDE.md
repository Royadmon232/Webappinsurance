# מדריך הגדרת n8n עם Amazon SES לאימות אימייל

## סקירה כללית

המערכת משתמשת בשתי מערכות נפרדות לשליחת מיילים:
1. **Gmail API** - שולח לידים לסוכן הביטוח כאשר לקוח לוחץ "קבל הצעת מחיר"
2. **n8n + Amazon SES** - שולח קודי אימות ללקוחות כאשר לוחצים "קבל קוד אימות"

## דרישות מוקדמות

1. חשבון n8n (self-hosted או cloud)
2. חשבון AWS עם Amazon SES מוגדר
3. כתובת מייל מאומתת ב-Amazon SES
4. משתני סביבה ב-Vercel

## שלבים להגדרה

### שלב 1: הגדרת Amazon SES ב-AWS

1. היכנס לקונסולת AWS
2. עבור ל-Amazon SES
3. אמת את הדומיין או כתובת המייל שלך
4. צור Access Key:
   - עבור ל-IAM
   - צור משתמש חדש עם הרשאות SES
   - שמור את ה-Access Key ID וה-Secret Access Key

### שלב 2: יצירת Workflow ב-n8n

1. צור workflow חדש ב-n8n
2. הוסף את הנודים הבאים:

#### נוד 1: Webhook
```json
{
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "webhookId": "your-webhook-id",
  "parameters": {
    "httpMethod": "POST",
    "path": "send-verification-email",
    "responseMode": "onReceived",
    "responseData": "allEntries",
    "responsePropertyName": "data"
  }
}
```

#### נוד 2: Set Variables
```json
{
  "name": "Set Email Variables",
  "type": "n8n-nodes-base.set",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "values": {
      "string": [
        {
          "name": "toEmail",
          "value": "={{$json[\"email\"]}}"
        },
        {
          "name": "verificationCode",
          "value": "={{$json[\"code\"]}}"
        },
        {
          "name": "subject",
          "value": "={{$json[\"subject\"]}}"
        },
        {
          "name": "htmlContent",
          "value": "={{$json[\"htmlContent\"]}}"
        }
      ]
    }
  }
}
```

#### נוד 3: AWS SES
```json
{
  "name": "Send Email via SES",
  "type": "n8n-nodes-base.awsSes",
  "typeVersion": 1,
  "position": [650, 300],
  "parameters": {
    "operation": "send",
    "toAddresses": "={{$node[\"Set Email Variables\"].json[\"toEmail\"]}}",
    "subject": "={{$node[\"Set Email Variables\"].json[\"subject\"]}}",
    "bodyHtml": "={{$node[\"Set Email Variables\"].json[\"htmlContent\"]}}",
    "fromEmail": "noreply@admon-insurance.co.il"
  },
  "credentials": {
    "aws": {
      "id": "your-aws-credential-id",
      "name": "AWS SES"
    }
  }
}
```

#### נוד 4: Response
```json
{
  "name": "Success Response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [850, 300],
  "parameters": {
    "respondWith": "json",
    "responseBody": {
      "success": true,
      "message": "Email sent successfully",
      "messageId": "={{$node[\"Send Email via SES\"].json[\"MessageId\"]}}"
    }
  }
}
```

### שלב 3: הגדרת Credentials ב-n8n

1. לך ל-Credentials ב-n8n
2. צור AWS credential חדש:
   - Region: `eu-north-1` (או האזור שלך)
   - Access Key ID: `YOUR_AWS_ACCESS_KEY_ID`
   - Secret Access Key: `YOUR_AWS_SECRET_ACCESS_KEY`

### שלב 4: הגדרת משתני סביבה ב-Vercel

הוסף את המשתנים הבאים ב-Vercel:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id/send-verification-email
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### שלב 5: בדיקת המערכת

1. **בדיקת n8n webhook:**
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/your-webhook-id/send-verification-email \
   -H "Content-Type: application/json" \
   -d '{
     "email": "test@example.com",
     "code": "123456",
     "subject": "Test Email",
     "htmlContent": "<h1>Test</h1><p>This is a test email</p>"
   }'
   ```

2. **בדיקה מהאתר:**
   - פתח את האתר
   - לחץ על "קבל הצעת מחיר"
   - מלא את הפרטים
   - בשלב האחרון, לחץ על "קבל קוד אימות"
   - בדוק שהמייל הגיע

## טיפול בבעיות נפוצות

### שגיאה 500 בשליחת קוד אימות

1. **בדוק שה-N8N_WEBHOOK_URL מוגדר נכון ב-Vercel:**
   - לך להגדרות הפרויקט ב-Vercel
   - בדוק ב-Environment Variables
   - וודא שה-URL נכון

2. **בדוק שה-workflow פעיל ב-n8n:**
   - הפעל את ה-workflow
   - בדוק ב-Executions אם יש שגיאות

3. **בדוק הרשאות Amazon SES:**
   - וודא שהכתובת/דומיין מאומתים
   - בדוק שאתה לא ב-Sandbox mode

### המייל לא מגיע

1. **בדוק ב-Amazon SES:**
   - לך ל-Sending Statistics
   - בדוק אם יש bounces או complaints

2. **בדוק בתיקיית הספאם:**
   - לפעמים המיילים נכנסים לספאם

3. **בדוק את תוכן המייל:**
   - וודא שה-HTML תקין
   - בדוק שאין תווים מיוחדים שגורמים לבעיות

## מבנה הנתונים שנשלח ל-n8n

```json
{
  "action": "send_verification_email",
  "email": "customer@example.com",
  "code": "123456",
  "subject": "קוד אימות - אדמון סוכנות לביטוח",
  "htmlContent": "<!-- Full HTML content -->",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## דוגמה לתגובה מוצלחת

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "0100018ed9f6a9b8-..."
}
``` 