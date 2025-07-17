#!/bin/bash

echo "🔄 בודק את ה-n8n webhook לשליחת קודי אימות..."
echo ""

# בדיקה עם הנתונים הבאים - החלף את המייל שלך
EMAIL="royadmon23@gmail.com"  # 👈 החלף למייל שלך כדי לקבל את המייל
CODE="123456"
SUBJECT="🧪 בדיקת n8n - קוד אימות"

echo "📧 שולח בקשה ל-webhook עם הפרטים הבאים:"
echo "   Email: $EMAIL"
echo "   Code: $CODE"
echo "   Subject: $SUBJECT"
echo ""

# שליחת בקשה ל-n8n webhook
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"code\": \"$CODE\",
    \"subject\": \"$SUBJECT\",
    \"htmlContent\": \"<html><body style='font-family: Arial, sans-serif; direction: rtl; text-align: right;'><div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'><div style='background: linear-gradient(135deg, #013369, #0052cc); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'><h1 style='margin: 0; font-size: 24px;'>אדמון סוכנות לביטוח</h1><p style='margin: 10px 0 0 0;'>🧪 בדיקת מערכת</p></div><div style='background: white; padding: 30px; border-radius: 0 0 10px 10px;'><h2>בדיקת שליחת מייל דרך n8n</h2><p>אם קיבלת את המייל הזה, המערכת עובדת תקין!</p><div style='background-color: #f8f9ff; border: 2px solid #013369; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'><p><strong>קוד האימות:</strong></p><div style='font-size: 32px; font-weight: bold; color: #013369; letter-spacing: 4px;'>$CODE</div></div><p style='color: #666; font-size: 14px;'>זהו מייל בדיקה מהטרמינל</p></div></div></body></html>\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
  }" \
  https://n8n.admon-insurance-agency.co.il/webhook/send-verification-email-brevo)

# הפרדת התגובה מסטטוס HTTP
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')

echo "📊 תוצאות הבדיקה:"
echo "   HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCESS! ה-webhook הגיב בהצלחה"
    echo ""
    echo "📝 תגובה מה-server:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    echo ""
    echo "📧 בדוק את תיבת המייל שלך (כולל תיקיית הספאם)!"
    echo "   המייל נשלח ל: $EMAIL"
elif [ "$HTTP_STATUS" = "500" ]; then
    echo "❌ שגיאה בשרת (500)"
    echo ""
    echo "📝 פרטי השגיאה:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    echo ""
    echo "🔍 דברים לבדוק:"
    echo "   1. האם ה-workflow פעיל ב-n8n?"
    echo "   2. בדוק ב-Executions ב-n8n מה קרה"
    echo "   3. האם ה-Brevo API key תקין?"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ ה-webhook לא נמצא (404)"
    echo ""
    echo "🔍 דברים לבדוק:"
    echo "   1. האם ה-URL נכון?"
    echo "   2. האם ה-workflow קיים ב-n8n?"
    echo "   3. האם ה-webhook path נכון?"
else
    echo "❌ שגיאה לא צפויה (HTTP $HTTP_STATUS)"
    echo ""
    echo "📝 תגובה מלאה:"
    echo "$HTTP_BODY"
fi

echo ""
echo "🔗 קישורים מועילים:"
echo "   • n8n Executions: https://n8n.admon-insurance-agency.co.il/workflow/[workflow-id]/executions"
echo "   • Brevo Dashboard: https://my.brevo.com"
echo ""
echo "💡 טיפ: אם הבדיקה עברה אבל המייל לא הגיע, בדוק:"
echo "   1. תיקיית הספאם"
echo "   2. שהמייל royadmon23@gmail.com מאומת ב-Brevo"
echo "   3. לוגים ב-Brevo Dashboard" 