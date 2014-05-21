# interface to scheduler goes here

# UGH

# not in use

import datetime


TIME_STEP = datetime.time(0,30) # half hour increments

class Scheduler:
    def __init__(self, cur, conn):
        self.cur = cur
        self.conn = conn
        
    def computeSchedule(self):
        # step 1: get calendar from db
        weekbegin = datetime.date.today()
        weekend = datetime.date.today() + datetime.timedelta(days=7)
        eventlist, tasklist = getCalendarList(weekbegin, weekend)
        
        # step 2: send to matlab
        
        # step 2a: format the lists appropriately
        
        # step 2b: actually send
        
        # step 3: get results from matlab
        
        # step 4: format back into a calendar (see logserver.py)
        
        return [[]]
    
    def saveSchedule(self, schedule):
        '''Save a computed schedule in the database'''
        for task in schedule:
            evtname = task[0]
            evttime = task[1]
            qstr = self.cur.mogrify("INSERT INTO calendar (event_name, event_type, event_time) VALUES (%s, 2, %s)", ((evtname, evttime)))
            print qstr
            self.cur.execute(qstr)
        self.conn.commit()
        
    def getCalendarList(self, tstart, tend):
        '''Return a list of (events, tasks) during the specified time frame'''
        
        qstr = cur.mogrify('''SELECT event_name, event_type, event_time, event_end
        FROM calendar WHERE event_time BETWEEN %s AND %s AND event_type <> 2 ORDER BY event_time''', ((weekbegin, weekend)))
        
        cur.execute(qstr)
        results = cur.fetchall()
        
        events = []
        tasks = []
        
        for r in results:
            starttime = r[2].isoformat()
            endtime = None if r[3] is None else r[3].isoformat()
            
            if r[1] == 0:
                events.append([r[0],starttime, endtime])
            elif r[1] == 1:
                tasks.append([r[0],starttime])
        
        return (events, tasks)