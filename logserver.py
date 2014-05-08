#!/usr/bin/env python
import cgi
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import inspect
import psycopg2
import datetime
import json
import sys
import urllib

try:
    preffile = open("preferences.json", 'r')
    prefs = json.load(preffile)
except:
    print "Error loading preferences from file!", sys.exc_info()
    sys.exit(0)

conn = psycopg2.connect("dbname=%s user=%s password=%s" % (prefs['dbinfo']['dbname'], prefs['dbinfo']['dbuser'], prefs['dbinfo']['dbpass']))
cur = conn.cursor()

class LoggerHTTPHandler(BaseHTTPRequestHandler) :
    def do_POST(self):
        content_len = int(self.headers.getheader('content-length'))
        result = self.rfile.read(content_len)
        print "RESULT:", result, ":END RESULT"
        code = 0
        try:
            code = int(result[0])
            result = result[1:]
        except:
            print "Error: incorrect code format"
        
        # we are using one server for all the informations
        if code == 0:
            # result is a date
            dt = datetime.datetime.now()
            cur.execute("INSERT INTO browsing (url, stamp) VALUES ('%s', '%s')" % (result, dt))
            conn.commit()
            print "added URL"
            
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write("Done!")
        elif code == 1:
            # result is a user prefs
            print "request for user preferences"
            pid_data = "hi derp"
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(pid_data)
        elif code == 2:
            # requesting a calendar
            print "request for calendar"
        elif code == 3:
            # inputting user preferences
            # "3=input+user+preferences&name=Your+name&gender=female"
            print urllib.unquote(result)
            print "store user preferences"
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write("Done user prefs!")
        elif code == 4:
            # inputting new event
            print "store new event"
        elif code == 5:
            # inputting new task
            print "store new task"
        else:
            print "lol what code is ", code
        
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