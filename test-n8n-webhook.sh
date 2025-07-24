#!/bin/bash

echo "🔄 בודק את ה-n8n webhook לשליחת קודי אימות..."
echo ""

# אימיילים שונים לבדיקה (כדי למנוע חסימת Gmail)
EMAIL_LIST=(
    "royadmon23@gmail.com"
    "test1@example.com" 
    "test2@example.com"
    "demo@test.co.il"
)

# בחירת אימייל רנדומלי או השתמשות בפרמטר
if [ "$1" != "" ]; then
    EMAIL="$1"
else
    # בחר אימייל רנדומלי מהרשימה
    EMAIL=${EMAIL_LIST[$RANDOM % ${#EMAIL_LIST[@]}]}
fi

# קודים שונים ונושאים מגוונים
CODE_LIST=("123456" "789012" "456789" "987654" "111222" "333444")
SUBJECT_LIST=(
    "🧪 בדיקת n8n - קוד אימות"
    "🔐 קוד אימות לביטוח דירה" 
    "✅ אימות חשבון - אדמון ביטוח"
    "🏠 קוד אימות להצעת מחיר"
)

CODE=${CODE_LIST[$RANDOM % ${#CODE_LIST[@]}]}
SUBJECT=${SUBJECT_LIST[$RANDOM % ${#SUBJECT_LIST[@]}]}

echo "📧 שולח בקשה ל-webhook עם הפרטים הבאים:"
echo "   Email: $EMAIL"
echo "   Code: $CODE"
echo "   Subject: $SUBJECT"
echo "   Time: $(date '+%H:%M:%S')"
echo ""

# HTML תוכן מגוון יותר
HTML_CONTENT="<html><body style='font-family: Arial, sans-serif; direction: rtl; text-align: right;'>
<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'>
    <div style='background: linear-gradient(135deg, #013369, #0052cc); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='margin: 0; font-size: 24px;'>אדמון סוכנות לביטוח</h1>
        <p style='margin: 10px 0 0 0;'>$SUBJECT</p>
    </div>
    <div style='background: white; padding: 30px; border-radius: 0 0 10px 10px;'>
        <h2>הנה קוד האימות שלך:</h2>
        <div style='background-color: #f8f9ff; border: 2px solid #013369; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
            <p><strong>קוד האימות:</strong></p>
            <div style='font-size: 32px; font-weight: bold; color: #013369; letter-spacing: 4px;'>$CODE</div>
        </div>
        <p style='color: #666; font-size: 14px;'>זהו מייל בדיקה - Time: $(date '+%H:%M:%S')</p>
        <p style='color: #666; font-size: 12px;'>Test ID: $(date +%s)</p>
    </div>
</div>
</body></html>"

# שליחת בקשה ל-n8n webhook
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\nTOTAL_TIME:%{time_total}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "User-Agent: TestScript/$(date +%s)" \
  -d "{
    \"email\": \"$EMAIL\",
    \"code\": \"$CODE\",
    \"subject\": \"$SUBJECT\",
    \"htmlContent\": \"$HTML_CONTENT\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"source\": \"terminal_test\",
    \"testId\": \"$(date +%s)\"
  }" \
  https://n8n.admon-insurance-agency.co.il/webhook/send-verification-email-brevo)

# הפרדת הנתונים
HTTP_BODY=$(echo "$RESPONSE" | head -n -2)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n2 | head -n1 | sed 's/HTTP_STATUS://')
TOTAL_TIME=$(echo "$RESPONSE" | tail -n1 | sed 's/TOTAL_TIME://')

echo ""
echo "📊 תוצאות הבדיקה:"
echo "   🌐 HTTP Status: $HTTP_STATUS"
echo "   ⏱️  Response Time: ${TOTAL_TIME}s"
echo "   📧 Email sent to: $EMAIL"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCESS! ה-webhook הגיב בהצלחה"
    echo ""
    echo "📝 תגובה מה-server:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    echo ""
    echo "🎯 מה לבדוק עכשיו:"
    echo "   1. 📧 תיבת המייל: $EMAIL"
    echo "   2. 📁 תיקיית הספאם"
    echo "   3. 📱 אפליקציית מייל בנייד"
    echo ""
    echo "💡 טיפ: אם לא קיבלת מייל, נסה עם כתובת אחרת:"
    echo "   ./test-n8n-webhook.sh another-email@domain.com"
    
elif [ "$HTTP_STATUS" = "500" ]; then
    echo "❌ שגיאה בשרת (500)"
    echo "📝 פרטי השגיאה:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    
else
    echo "⚠️  תגובה לא צפויה (Status: $HTTP_STATUS)"
    echo "📝 תגובה:"
    echo "$HTTP_BODY"
fi

echo ""
echo "🔗 קישורים למעקב:"
echo "   • N8N Dashboard: https://n8n.admon-insurance-agency.co.il"
echo "   • Brevo Logs: https://my.brevo.com"
echo "" 