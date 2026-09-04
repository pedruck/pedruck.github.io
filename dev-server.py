import os
import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    directory = os.path.dirname(os.path.abspath(__file__))
    handler = partial(NoCacheHandler, directory=directory)
    HTTPServer(('', port), handler).serve_forever()
