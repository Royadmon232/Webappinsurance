# Insurance Web Application -   אדמון סוכנות לביטוח

מערכת ווב מלאה לביטוח דירה עם טופס רב-שלבי, אימות טלפוני ושליחת מיילים אוטומטית.

## תכונות

- 🏠 טופס ביטוח דירה רב-שלבי מקיף
- 📱 אימות טלפוני עם SMS
- 📧 שליחת מיילים אוטומטית
- 🔒 אבטחת מידע והצפנה
- 💾 שמירת נתונים במסד נתונים MongoDB
- 🚀 ביצועים מהירים עם Express.js
- 🎨 עיצוב רספונסיב  י ומודרני 
- 🇮🇱 תמיכה מלאה בעברית RTL

## דרישות מערכת

- Node.js 14.0 ומעלה
- MongoDB 4.0 ומעלה
- חשבון Twilio (לשליחת SMS)
- חשבון Gmail עם App Password (לשליחת מיילים)

## התקנה

### 1. שכפל את הפרויקט

```bash
git clone https://github.com/Royadmon232/Webappinsurance.git
cd website
```

### 2. התקן תלויות

```bash
npm install
```

### 3. הגדר משתני סביבה

צור קובץ `.env` בתיקיית השורש והעתק את התוכן מ-`env.example`:

```bash
cp env.example .env
```

ערוך את הקובץ `.env` והוסף את הפרטים שלך:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/insurance_db

# JWT Secret
JWT_SECRET=your-super-secret-key-here

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### 4. התקן והפעל MongoDB

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows:
הורד והתקן מ: https://www.mongodb.com/try/download/community

#### Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## הפעלה

### מצב פיתוח

הפעל את השרת:
```bash
npm run dev
```

בטרמינל נפרד, הפעל את הלקוח:
```bash
npm run client
```

הגלוש אל:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

### מצב ייצור

```bash
npm start
```

## הגדרת Twilio

1. צור חשבון ב-[Twilio](https://www.twilio.com)
2. קנה מספר טלפון ישראלי
3. העתק את ה-Account SID, Auth Token ומספר הטלפון לקובץ `.env`

## הגדרת Gmail

1. הפעל אימות דו-שלבי בחשבון Gmail שלך
2. צור App Password:
   - לך ל: https://myaccount.google.com/apppasswords
   - בחר "Mail" ו-"Other"
   - העתק את הסיסמה לקובץ `.env`

## API Endpoints

### `POST /api/send-verification`
שליחת קוד אימות ל-SMS

Body:
```json
{
  "phoneNumber": "050-1234567"
}
```

### `POST /api/verify-code`
אימות הקוד שהתקבל

Body:
```json
{
  "phoneNumber": "050-1234567",
  "code": "123456"
}
```

### `POST /api/submit-form`
שליחת טופס הביטוח

Headers:
```
Authorization: Bearer <token>
```

Body: כל נתוני הטופס

### `GET /api/form-status/:formId`
בדיקת סטטוס טופס

## מבנה הפרויקט

```
website/
├── index.html          # דף הבית
├── script.js          # לוגיקת צד לקוח
├── style.css          # עיצוב
├── server.js          # שרת Express
├── package.json       # תלויות
├── env.example        # דוגמת משתני סביבה
└── README.md          # קובץ זה
```

## אבטחה

- 🔐 הצפנת מספרי תעודת זהות עם bcrypt
- 🔑 אימות JWT לכל הבקשות
- 🚦 Rate limiting למניעת spam
- 🛡️ Helmet.js להגנות HTTP
- ✅ ולידציה של כל הקלטים

## תרומה

נשמח לקבל תרומות! אנא פתח Issue או Pull Request.

## רישיון

ISC

## יצירת קשר

אדמון סוכנות לביטוח
📧 royadmon23@gmail.com

---

פותח עם ❤️ עבור אדמון סוכנות לביטוח

<!-- redeploy trigger --> 
