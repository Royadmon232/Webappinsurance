# 🔧 עדכון N8N Workflow - תיקון מפתח Brevo API

## 🔍 הבעיה שהתגלתה

**BREVO_API_KEY חסר או לא תקין ב-N8N!**

למרות ש-N8N מחזיר הצלחה, המיילים לא נשלחים כי:
- מפתח ה-API של Brevo לא מוגדר או שגוי
- Brevo דוחה את הבקשות בשקט
- N8N לא מזהה את השגיאה

## 🚨 תסמינים של הבעיה

✅ N8N מחזיר HTTP 200 (הצלחה)  
❌ המיילים לא מגיעים ללקוחות  
❌ בדיקת API מחזירה: `authentication not found in headers`  

## 🔧 הפתרון המלא

### שלב 1: יצירת מפתח Brevo API חדש

1. **היכנס ל-Brevo:**
   ```
   https://my.brevo.com
   ```

2. **צור מפתח API:**
   - לחץ על השם שלך (פינה ימנית למעלה)
   - בחר **"SMTP & API"**
   - לשונית **"API Keys"**
   - **"Generate a new API key"**
   - שם: "N8N-Webhook"
   - **"Generate"**
   - **העתק את המפתח!** (לא תוכל לראות שוב)

### שלב 2: עדכון N8N Environment Variables

1. **היכנס ל-N8N Dashboard:**
   ```
   https://n8n.admon-insurance-agency.co.il
   ```

2. **הגדר משתנה סביבה:**
   - לך ל-**Settings** (הגדרות)
   - בחר **Environment Variables**
   - הוסף/עדכן:
     ```
     BREVO_API_KEY=המפתח-שקיבלת-מ-Brevo
     ```
   - שמור את השינויים

### שלב 3: בדיקת ה-Workflow

1. **פתח את ה-workflow "Brevo Email Verification"**

2. **בדוק את נוד "Send Email via Brevo API":**
   - ודא שה-API key header מוגדר כ:
     ```
     api-key: {{ $env.BREVO_API_KEY }}
     ```

3. **אקטיב את ה-workflow מחדש:**
   - כבה ↔️ הפעל

### שלב 4: בדיקה מפורטת

הרץ את הפקודה הבאה לבדיקה:
```bash
./test-n8n-webhook.sh
```

**מה לחפש:**
- ✅ HTTP 200 response
- ✅ JSON עם `"success": true`
- ✅ `messageId` בתגובה
- ✅ המייל מגיע בפועל!

## 🔍 פתרון בעיות נוספות

### אם המייל עדיין לא מגיע:

1. **בדוק ב-Brevo Dashboard:**
   ```
   https://my.brevo.com > Email Activity
   ```
   - חפש את המייל שנשלח
   - בדוק אם יש שגיאות

2. **בדוק IP Security:**
   - ב-Brevo: **Account** > **Security**
   - ודא שה-IP של N8N מאושר

3. **בדוק Sender Domain:**
   - ודא ש-`royadmon23@gmail.com` מאומת ב-Brevo
   - או הוסף אותו כ-Sender

### בדיקת מפתח API:

```bash
curl -X GET "https://api.brevo.com/v3/account" \
     -H "api-key: המפתח-שלך"
```

**תגובה תקינה:**
```json
{
  "firstName": "...",
  "lastName": "...",
  "companyName": "...",
  "email": "..."
}
```

## ✅ אחרי התיקון

המיילים יגיעו בהצלחה ללקוחות!

## 🆘 עזרה נוספת

אם עדיין לא עובד:
1. שלח צילום מסך של N8N Execution
2. העתק את התגובה מהבדיקת API
3. בדוק ב-Brevo Email Activity

---

**עודכן:** $(date '+%d/%m/%Y %H:%M')  
**גרסה:** v2.0 - תיקון מפתח API 