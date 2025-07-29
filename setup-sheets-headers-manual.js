/**
 * Manual Google Sheets Headers Setup
 * 
 * Copy these headers to your Google Sheet's first row (A1:BH1)
 * Sheet Name: לידים
 */

const headers = [
  "תאריך",
  "שעה",
  "שם פרטי",
  "שם משפחה", 
  "ת.ז.",
  "טלפון",
  "אימייל",
  "תאריך התחלת ביטוח",
  "סוג מוצר",
  "סוג נכס",
  "עיר",
  "רחוב",
  "מספר בית",
  "מספר קומות",
  "יש גינה",
  "בנק משעבד",
  "סניף בנק",
  "סכום ביטוח מבנה",
  "גיל המבנה",
  "שטח מבנה",
  "סוג בניה",
  "סטנדרט בניה",
  "משועבד/מוטב",
      "תאריך סיום ההלוואה האחרונה",
  "יש מרפסת",
  "שטח מרפסת",
  "יש גינה (מבנה)",
  "שטח גינה",
  "סוג גג",
  "יש בריכת שחיה",
  "שווי בריכת שחיה",
  "כיסוי נזקי צנרת",
  "השתתפות עצמית נזקי מים",
  "פריצה למבנה",
  "כיסוי רעידת אדמה",
  "כיסוי שווי קרקע ברעידת אדמה",
  "סכום כיסוי רעידת אדמה",
  "שווי תכולה",
  "גיל מבנה (תכולה)",
  "יש תכשיטים",
  "סכום תכשיטים",
  "יש שעונים",
  "סכום שעונים",
  "סכום מצלמות",
  "סכום ציוד אלקטרוני",
  "סכום אופניים",
  "סכום כלי נגינה",
  "כיסוי רעידת אדמה לתכולה",
  "צד שלישי",
  "חבות מעבידים",
  "סייבר למשפחה",
  "טרור",
  "ביטוח רכוש משותף נוסף",
  "ביטוח תכולת המבנה",
  "ביטוח מחסן",
  "ביטוח בריכת שחיה",
  "נזקי מים למשכנתא"
];

console.log("Google Sheets Headers Setup");
console.log("===========================");
console.log(`Total headers: ${headers.length}`);
console.log("\n1. Copy these headers to your Google Sheet:");
console.log(headers.join('\t'));

console.log("\n2. Or copy them one by one:");
headers.forEach((header, index) => {
  let column = '';
  let num = index;
  
  if (num >= 26) {
    column += String.fromCharCode(65 + Math.floor(num / 26) - 1);
  }
  column += String.fromCharCode(65 + (num % 26));
  
  console.log(`${column}1: ${header}`);
});

console.log("\n3. Sheet URL: https://docs.google.com/spreadsheets/d/1yVzUX6NCh3yhR3rTs4o53axD9CXBeGD-iqv8AFWdYeE");
console.log("4. Make sure to share with: sheets-writer@graceful-fact-463514-e5.iam.gserviceaccount.com");

// Export for browser use
if (typeof window !== 'undefined') {
  window.sheetsHeaders = headers;
  console.log("Headers available as window.sheetsHeaders");
}

module.exports = headers; 