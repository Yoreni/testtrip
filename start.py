import http.server
import socketserver
import webbrowser
import os

# Specify the port to use
PORT = 8081

# Set the directory to serve files from
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Start the server
with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"serving at port {PORT}")
    webbrowser.open(f"http://localhost:{PORT}")             # open the game in the browser
    httpd.serve_forever()
