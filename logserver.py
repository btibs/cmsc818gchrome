#!/usr/bin/env python
import cgi
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import inspect
import psycopg2
import datetime

conn = psycopg2.connect("dbname=usagelog user=cmsc818g password=pwd")
cur = conn.cursor()

class LoggerHTTPHandler(BaseHTTPRequestHandler) :
    def do_POST(self):
        content_len = int(self.headers.getheader('content-length'))
        result = self.rfile.read(content_len)
        print "RESULT:", result, ":END RESULT"
        
        dt = datetime.datetime.now()
        cur.execute("INSERT INTO browsing (url, stamp) VALUES ('%s', '%s')" % (result, dt))
        conn.commit()
        
        self.send_response(200)

        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write("Done!")
        return

def main():
    try:
        server = HTTPServer(('', 8000), LoggerHTTPHandler);
        print "Started Logger HTTPServer, using <Ctrl-C> to stop"
        server.serve_forever();
    except KeyboardInterrupt:
        print "<Ctrl-C> received, shutting down server"
        server.socket.close()
        cur.close()
        conn.close()

if __name__ == '__main__':
    main()