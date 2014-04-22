# get processes list

import psutil

#processes = [proc for proc in psutil.process_iter()]
procnames = []
for proc in psutil.process_iter():
try:
    procnames.append(proc.name())
except psutil.AccessDenied: # not sure why / when this happens even though I'm running as admin
    pass

# can also get cpu_times and cpu_percent but we are probably going to be polling continuously so we can just do that??
