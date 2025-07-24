#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OAuth Demo Server for Google API Verification
אדמון סוכנות לביטוח - שרת דמו להרשאת Google API

Usage:
    python3 run-oauth-demo.py

Then open: http://localhost:8000/oauth-demo.html
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000

def main():
    print("🚀 הפעלת שרת דמו OAuth...")
    print("=" * 50)
    
    # וודא שהקבצים קיימים
    current_dir = Path.cwd()
    oauth_demo_file = current_dir / "oauth-demo.html"
    
    if not oauth_demo_file.exists():
        print("❌ שגיאה: הקובץ oauth-demo.html לא נמצא!")
        print("וודא שאתה מריץ את הסקריפט מהתיקייה הנכונה")
        return
    
    print(f"📁 תיקיית עבודה: {current_dir}")
    print(f"🌐 פורט: {PORT}")
    
    # הגדר שרת HTTP פשוט
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # הוסף CORS headers לצורך הדמו
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            super().end_headers()
        
        def log_message(self, format, *args):
            # הדפס הודעות בעברית
            message = format % args
            if "oauth-demo.html" in message:
                print(f"✅ טוען דף דמו: {message}")
            else:
                print(f"📡 {message}")
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🎯 שרת דמו פועל בכתובת: http://localhost:{PORT}")
            print(f"🔗 קישור לדמו: http://localhost:{PORT}/oauth-demo.html")
            print()
            print("📋 הוראות:")
            print("1. פתח את הקישור למעלה בדפדפן")
            print("2. עדכן את CLIENT_ID בקובץ oauth-demo.html")
            print("3. התחל להקליט וידאו")
            print("4. עקוב אחר ההוראות בעמוד")
            print()
            print("🛑 ללחיצה על Ctrl+C להפסקת השרת")
            print("=" * 50)
            
            # פתח דפדפן אוטומטית
            try:
                webbrowser.open(f'http://localhost:{PORT}/oauth-demo.html')
                print("🌐 פתיחת דפדפן...")
            except:
                print("💡 פתח ידנית את הקישור בדפדפן")
            
            # הפעל שרת
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 השרת נעצר על ידי המשתמש")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ שגיאה: פורט {PORT} כבר בשימוש!")
            print("נסה לסגור תוכניות אחרות או להמתין דקה")
        else:
            print(f"❌ שגיאה בהפעלת השרת: {e}")
    except Exception as e:
        print(f"❌ שגיאה לא צפויה: {e}")

if __name__ == "__main__":
    # בדוק גרסת Python
    if sys.version_info < (3, 6):
        print("❌ שגיאה: נדרשת Python 3.6 ומעלה")
        sys.exit(1)
    
    main() 