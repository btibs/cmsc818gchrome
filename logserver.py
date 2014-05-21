#!/usr/bin/env python
import cgi
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import inspect
import psycopg2
import datetime
import json
import sys
import urllib, urlparse
import dateutil.parser

from scheduler import Scheduler

try:
    preffile = open("preferences.json", 'r')
    prefs = json.load(preffile)
    preffile.close()
except:
    print "Error loading preferences from file!", sys.exc_info()
    sys.exit(0)

conn = psycopg2.connect("dbname=%s user=%s password=%s" % (prefs['dbinfo']['dbname'], prefs['dbinfo']['dbuser'], prefs['dbinfo']['dbpass']))
cur = conn.cursor()

sched = Scheduler(cur, conn)

# not used
def roundTime(t, dir=0):
    '''Round the given time to the nearest half hour in the specified direction 0 = down, 1 = up'''
    if t is None: return None
    
    if dir == 1: # round up
        if t.minute > 0 and t.minute < 30:
            t = t.replace(minute=30)
        elif t.minute > 30:
            t = t.replace(minute=0) + datetime.timedelta(hours=1)
    else: # round down
        if t.minute > 0 and t.minute < 30:
            t = t.replace(minute=0)
        elif t.minute > 30:
            t = t.replace(minute=30)
    
    return t
    
class LoggerHTTPHandler(BaseHTTPRequestHandler) :
    def do_POST(self):
        content_len = int(self.headers.getheader('content-length'))
        result = self.rfile.read(content_len)
        print "RESULT:", result, ":END RESULT"
        code = 0
        try:
            code = int(result[0])
        except:
            print "Error: incorrect code format"
        
        # we are using one server for all the information
        if code == 0:
            # result is a date
            result = result[1:]
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
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(json.dumps(prefs['userinfo']))
        elif code == 2:
            # requesting a calendar
            print "request for calendar"
            
            cal = []
            
            # get dates for calendar
            weekbegin = datetime.date.today()
            weekend = datetime.date.today() + datetime.timedelta(days=7)
            qstr = cur.mogrify('''SELECT event_name, event_type, event_time, event_end
FROM calendar WHERE event_time BETWEEN %s AND %s ORDER BY event_time''', ((weekbegin, weekend)))
            print qstr
            cur.execute(qstr)
            results = cur.fetchall()
            
            print results
            actualresults = []
            for r in results:
                starttime = r[2].isoformat()
                endtime = None if r[3] is None else r[3].isoformat()
                
                row = {'name':r[0],
                    'type':r[1], #0: event, 1: task, 2: scheduled
                    'start':starttime,
                    'end':endtime
                }
                print row
                actualresults.append(row)
            
            tosend = json.dumps(actualresults)
            print tosend
            print
            
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(tosend)
        elif code == 3:
            # inputting user preferences
            newPrefs = urlparse.parse_qs(result)
            print "store user preferences"
            
            del(newPrefs['3'])
            # flatten because it puts things in an array for some reason
            for k,v in newPrefs.iteritems():
                newPrefs[k] = newPrefs[k][0]
            prefs['userinfo'] = newPrefs
            
            with open('preferences.json', 'w') as outfile:
                json.dump(prefs, outfile)
            
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write("Done user prefs!")
        elif code == 4:
            # inputting new event
            print "store new event"
            newEvt = urlparse.parse_qs(result)
            del(newEvt['4'])
            for k,v in newEvt.iteritems(): newEvt[k] = newEvt[k][0]
            
            newEvt['start'] = dateutil.parser.parse(newEvt['start'])
            newEvt['end'] = dateutil.parser.parse(newEvt['end'])
            
            qstr = cur.mogrify("INSERT INTO calendar (event_name, event_time, event_end, event_type) VALUES (%s, %s, %s, 0)", (newEvt['name'], newEvt['start'], newEvt['end']))
            print qstr
            cur.execute(qstr)
            conn.commit()
            
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write("Done new event!")
        elif code == 5:
            # inputting new task
            newTask = urlparse.parse_qs(result)
            del(newTask['5'])
            # flatten
            for k,v in newTask.iteritems(): newTask[k] = newTask[k][0]
            
            # parse the task information
            newTask['diff'] = int(newTask['diff']) # difficulty, in 1/2 hrs
            newTask['due'] = dateutil.parser.parse(newTask['due']) # due date
            
            qstr = cur.mogrify('''INSERT INTO calendar
(event_time, event_name, event_type, workload)
VALUES
(%s, %s, 1, %s);
''', (newTask['due'], newTask['name'], newTask['diff']))
            print qstr
            cur.execute(qstr)
            conn.commit()
            
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write("Done new task!")
            
            print "stored new task"
        else:
            print "Unknown code:", code
        
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