/**
 * Google Sheets Headers Setup Helper
 * Run this script to get the headers in a format easy to copy to Google Sheets
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
  "מיקוד",
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

console.log("\n🎯 Google Sheets Headers Setup");
console.log("=".repeat(50));
console.log(`\nTotal columns: ${headers.length} (A to ${String.fromCharCode(65 + headers.length - 1)})`);
console.log("\n📋 Headers separated by tabs (copy and paste to row 1 in Google Sheets):\n");
console.log(headers.join("\t"));

console.log("\n\n📊 Column mapping:");
console.log("-".repeat(50));
headers.forEach((header, index) => {
  const column = index < 26 
    ? String.fromCharCode(65 + index)
    : String.fromCharCode(65 + Math.floor(index / 26) - 1) + String.fromCharCode(65 + (index % 26));
  console.log(`${column}: ${header}`);
});

console.log("\n\n✅ Instructions:");
console.log("1. Copy the tab-separated headers above");
console.log("2. Open your Google Sheet");
console.log("3. Click on cell A1");
console.log("4. Paste the headers");
console.log("5. The headers will automatically fill columns A through BH");
console.log("\n💡 Tip: Make sure the sheet is named 'לידים' (or update GOOGLE_SHEETS_RANGE accordingly)"); 