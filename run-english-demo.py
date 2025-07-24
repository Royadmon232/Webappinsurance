#!/usr/bin/env python3
"""
English OAuth Demo Server for Google API Verification
Admon Insurance Agency - Gmail API Demo

Usage:
    python3 run-english-demo.py

Then open: http://localhost:8000/oauth-demo-english.html
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000

def main():
    print("🚀 Starting Gmail API OAuth Demo Server...")
    print("=" * 60)
    
    # Check if demo file exists
    current_dir = Path.cwd()
    demo_file = current_dir / "oauth-demo-english.html"
    
    if not demo_file.exists():
        print("❌ Error: oauth-demo-english.html not found!")
        print("Make sure you're running this script from the correct directory")
        return
    
    print(f"📁 Working directory: {current_dir}")
    print(f"🌐 Port: {PORT}")
    
    # Setup HTTP server
    class DemoHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # Add CORS headers for demo
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            super().end_headers()
        
        def log_message(self, format, *args):
            message = format % args
            if "oauth-demo-english.html" in message:
                print(f"✅ Loading demo page: {message}")
            else:
                print(f"📡 {message}")
    
    try:
        with socketserver.TCPServer(("", PORT), DemoHTTPRequestHandler) as httpd:
            print(f"🎯 Demo server running at: http://localhost:{PORT}")
            print(f"🔗 Demo URL: http://localhost:{PORT}/oauth-demo-english.html")
            print()
            print("📋 Instructions for Google Verification Video:")
            print("1. Open the demo URL in Chrome browser")
            print("2. Start screen recording (full screen)")
            print("3. Follow the OAuth flow step by step")
            print("4. Show consent screen clearly")
            print("5. Demonstrate real email sending")
            print("6. Stop recording and upload to Google Drive")
            print()
            print("🎬 IMPORTANT: Google reviewers need to see the complete OAuth consent screen!")
            print("Make sure to wait 2-3 seconds on each screen for clarity.")
            print()
            print("🛑 Press Ctrl+C to stop server")
            print("=" * 60)
            
            # Open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}/oauth-demo-english.html')
                print("🌐 Opening browser...")
            except:
                print("💡 Please open the URL manually in your browser")
            
            # Start server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: Port {PORT} is already in use!")
            print("Try closing other applications or wait a minute")
        else:
            print(f"❌ Server error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    # Check Python version
    if sys.version_info < (3, 6):
        print("❌ Error: Python 3.6 or higher required")
        sys.exit(1)
    
    # Show configuration info
    print("🔧 Configuration Info:")
    print("CLIENT_ID: 476619737917-897o8kin4slckl9k3rqc39eu38gqsggo.apps.googleusercontent.com")
    print("EMAIL: royadmon23@gmail.com")
    print("PROJECT: graceful-fact-463514-e5")
    print()
    
    main() 