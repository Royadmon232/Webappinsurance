#!/bin/bash

echo "🔄 בדיקה מפורטת של n8n workflow..."
echo "=================================="
echo ""

# בדיקה עם הנתונים הבאים
EMAIL="royadmon23@gmail.com"  # 👈 המייל שלך
CODE="789012"
SUBJECT="🔥 בדיקה מפורטת - קוד אימות"

echo "📧 פרטי הבדיקה:"
echo "   📍 Email: $EMAIL"
echo "   🔢 Code: $CODE"
echo "   📝 Subject: $SUBJECT"
echo "   🕐 Time: $(date '+%H:%M:%S')"
echo ""

echo "🚀 שולח בקשה ל-n8n webhook..."

# שליחת בקשה עם פרטים מלאים
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\nTOTAL_TIME:%{time_total}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "User-Agent: TestScript/1.0" \
  -d "{
    \"email\": \"$EMAIL\",
    \"code\": \"$CODE\",
    \"subject\": \"$SUBJECT\",
    \"htmlContent\": \"<html><head><meta charset='UTF-8'></head><body style='font-family: Arial, sans-serif; direction: rtl; text-align: right; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); margin: 0; padding: 20px;'><div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;'><div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;'><h1 style='margin: 0; font-size: 28px; font-weight: 300;'>🏢 אדמון סוכנות לביטוח</h1><p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>🔥 בדיקה מפורטת של המערכת</p></div><div style='padding: 40px;'><h2 style='color: #333; margin-bottom: 20px;'>בדיקת שליחת מייל מהטרמינל</h2><p style='color: #666; font-size: 16px; line-height: 1.6;'>אם קיבלת את המייל הזה, זה אומר ש:</p><ul style='color: #666; font-size: 15px; line-height: 1.8;'><li>✅ ה-webhook מקבל נתונים</li><li>✅ ה-Debug node עובד</li><li>✅ ה-HTTP Request node מתחבר ל-Brevo</li><li>✅ ה-Headers נכונים</li><li>✅ ה-JSON Body תקין</li><li>✅ Brevo API עובד</li></ul><div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0;'><p style='margin: 0 0 10px 0; font-size: 18px; font-weight: bold;'>🔑 קוד האימות שלך:</p><div style='font-size: 36px; font-weight: bold; letter-spacing: 6px; margin: 10px 0;'>${CODE}</div><p style='margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;'>הקוד תקף למשך 10 דקות</p></div><div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;'><p style='margin: 0; color: #495057; font-size: 14px;'><strong>🕐 זמן שליחה:</strong> $(date '+%d/%m/%Y %H:%M:%S')</p><p style='margin: 5px 0 0 0; color: #495057; font-size: 14px;'><strong>🔗 מקור:</strong> בדיקה מהטרמינל</p></div></div><div style='background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;'><p style='margin: 0; color: #6c757d; font-size: 14px;'>אדמון סוכנות לביטוח | טלפון: 050-931-3531</p><p style='margin: 5px 0 0 0; color: #6c757d; font-size: 12px;'>זהו מייל בדיקה אוטומטי מהמערכת</p></div></div></body></html>\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"source\": \"terminal_test\"
  }" \
  https://n8n.admon-insurance-agency.co.il/webhook/send-verification-email-brevo)

# הפרדת הנתונים
HTTP_BODY=$(echo "$RESPONSE" | head -n -2)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n2 | head -n1 | sed 's/HTTP_STATUS://')
TOTAL_TIME=$(echo "$RESPONSE" | tail -n1 | sed 's/TOTAL_TIME://')

echo ""
echo "📊 תוצאות מפורטות:"
echo "   🌐 HTTP Status: $HTTP_STATUS"
echo "   ⏱️  Response Time: ${TOTAL_TIME}s"
echo "   📡 Webhook URL: https://n8n.admon-insurance-agency.co.il/webhook/send-verification-email-brevo"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCESS! ה-webhook הגיב בהצלחה"
    echo ""
    echo "📝 תגובה מה-server:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    echo ""
    echo "🎯 מה לבדוק עכשיו:"
    echo "   1. 📧 תיבת המייל שלך: $EMAIL"
    echo "   2. 📁 תיקיית הספאם"
    echo "   3. 🔍 n8n Executions (קישור למטה)"
    echo "   4. 📊 Brevo Dashboard"
    echo ""
    echo "🔗 קישורים חשובים:"
    echo "   • n8n Dashboard: https://n8n.admon-insurance-agency.co.il"
    echo "   • Brevo Dashboard: https://my.brevo.com"
    echo "   • Brevo Email Activity: https://my.brevo.com/campaign/stats"
    
elif [ "$HTTP_STATUS" = "500" ]; then
    echo "❌ שגיאה בשרת (500) - יש בעיה ב-workflow"
    echo ""
    echo "📝 פרטי השגיאה:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    echo ""
    echo "🔍 דברים לבדוק ב-n8n:"
    echo "   1. 📋 לך ל-Executions ותראה את השגיאה"
    echo "   2. 🐛 בדוק את ה-Debug node"
    echo "   3. 🔑 וודא שה-API key תקין"
    echo "   4. 📝 בדוק שה-JSON Body נכון"
    echo "   5. 📡 בדוק שה-Headers נכונים"
    
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ ה-webhook לא נמצא (404)"
    echo ""
    echo "🔍 דברים לבדוק:"
    echo "   1. 🔗 האם ה-URL נכון?"
    echo "   2. 📋 האם ה-workflow קיים וpublic?"
    echo "   3. ▶️  האם ה-workflow פעיל (Active)?"
    echo "   4. 🔄 נסה לreset את ה-webhook"
    
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    echo "❌ שגיאת הרשאה ($HTTP_STATUS)"
    echo ""
    echo "🔍 דברים לבדוק:"
    echo "   1. 🔑 האם ה-API key של Brevo תקין?"
    echo "   2. 📧 האם המייל royadmon23@gmail.com מאומת ב-Brevo?"
    echo "   3. 💳 האם יש קרדיט ב-Brevo account?"
    
else
    echo "❌ שגיאה לא צפויה (HTTP $HTTP_STATUS)"
    echo ""
    echo "📝 תגובה מלאה:"
    echo "$HTTP_BODY"
fi

echo ""
echo "🔄 אם אתה רוצה לבדוק שוב, הרץ:"
echo "   ./test-detailed.sh"
echo ""
echo "📱 לבדיקה מהאתר, לך ל:"
echo "   https://admon-insurance-agency.co.il → קבל הצעת מחיר → קבל קוד אימות" 