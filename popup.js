// adapted from http://markashleybell.com/building-a-simple-google-chrome-extension.html

// global reference to div
var statusDisplay = null;
var username = null;

function tabSwitch(tabName) {
	var navbar = document.getElementById('navbar');
	var links = navbar.getElementsByTagName("li");
	for (var i=0; i < links.length; i++) {
		if (links[i].getAttribute("id") == tabName + "Link")
			links[i].setAttribute("class", "selected");
		else
			links[i].setAttribute("class", "unselected");
	}
	
	var main = document.getElementById("main");
	var tabs = main.getElementsByTagName("div");
	for (var i=0;i<tabs.length; i++) {
		if (tabs[i].getAttribute("id") == tabName)
			tabs[i].setAttribute("class", "selected");
		else
			tabs[i].setAttribute("class", "unselected");
	}
	
	// clear status messages
	document.getElementById("userStatus").innerHTML = "";
	document.getElementById("taskStatus").innerHTML = "";
	document.getElementById("eventStatus").innerHTML = "";
		
	// tab-specific function
	if (tabName == "preferences")
		populateUserPrefs();
	
	if (tabName == "calendar")
		calendarUpdate();
}

function userUpdate() {
    // cancel the form submit
    event.preventDefault();
	
	// get information from the form
	var name = document.getElementById('username').value;
	var age = document.getElementById('userage').value;
	var gender = document.querySelector('input[name="gender"]:checked');
	gender = (gender) ? gender.value : 'none';
	var worktime = document.getElementById("workTime").value;
	var resttime = document.getElementById("restTime").value;
	var notifyhow = document.querySelector('input[name="notifyhow"]:checked');
	
	$.post("http://127.0.0.1:8000/Logger",
		{
			3:"input user preferences",
			"name":name,
			"age":age,
			"gender":gender,
			"worktime":worktime,
			"resttime":resttime,
			"notify":notifyhow
		},
		function(data,status){
			if (status == "success") {
				document.getElementById("userStatus").innerHTML = "Saved!";
				setTimeout(function(){document.getElementById("userStatus").innerHTML="";}, 500);
			} else {
				alert("Error updating preferences, please try again");
			}
		});
}

function taskUpdate() {
	event.preventDefault();
	statusDisplay.innerHTML = "task updated";
	
	var taskName = document.getElementById("taskName").value;
	var taskDue = document.getElementById("taskDue").value;
	var taskDifficulty = document.getElementById("taskDifficulty").value;
	
	$.post("http://127.0.0.1:8000/Logger",
		{
			5:"input task",
			"name":taskName,
			"due":taskDue,
			"diff":taskDifficulty
		},
		function(data,status){
			if (status == "success") {
				//alert("Data: " + data + "\nStatus: " + status);
				document.getElementById("taskStatus").innerHTML = "Saved!";
				setTimeout(function(){document.getElementById("taskStatus").innerHTML="";}, 500);
				
				statusDisplay.innerHTML += "... and posted";
				
				// todo: display confirmation message
				
				// clear the fields
				document.getElementById("taskName").value = "";
				document.getElementById("taskDue").value = "";
				document.getElementById("taskDifficulty").value = "";
			} else {
				alert("Error adding task, please try again");
			}
		});
}

function eventUpdate() {
	event.preventDefault();
	
	var evtName = document.getElementById("eventName").value;
	var evtStart = document.getElementById("eventStart").value;
	var evtEnd = document.getElementById("eventEnd").value;
	
	$.post("http://127.0.0.1:8000/Logger",
	{
		4:"input event",
		"name":evtName,
		"start":evtStart,
		"end":evtEnd
	},
	function(data,status){
		if (status == "success") {
			//alert("Data: " + data + "\nStatus: " + status);
			statusDisplay.innerHTML = "event updated";
			document.getElementById("eventStatus").innerHTML = "Saved!";
			setTimeout(function(){document.getElementById("eventStatus").innerHTML="";}, 500);
			
			// todo: display confirmation message
			// clear fields
			document.getElementById("eventName").value = "";
			document.getElementById("eventStart").value = "";
			document.getElementById("eventEnd").value = "";
		} else {
			alert("Error adding event, please try again");
		}
	});
}

function calendarUpdate() {
	event.preventDefault();
	statusDisplay.innerHTML = "calendar updating";
	
	// clear calendar
	buildCalendar(null);
	
	// get actual calendar from db
	$.post("http://127.0.0.1:8000/Logger", "2getcalendar",
	function(data,status){
		if (status == "success") {
			//alert("Data: " + data + "\nStatus: " + status);
			
			var info = JSON.parse(data);
			
			// convert into calendar format
			events = new Array(7);
			var timeStart = 6;
			var timeEnd = 23;
			var timeStep = 0.5;
			var today = new Date();
			var dayOffset = today.getDay();
			
			timeslots = (timeEnd - timeStart)/timeStep+1;
			for (var i=0; i < events.length; i++) {
				events[i] = new Array(timeslots);
				for (var j=0; j < events[i].length; j++) {
					events[i][j] = new Array();
					
					// todo: this is way inefficient
					for (var x=0; x<info.length; x++) {
						var added = false;
						
						var starttime = new Date(info[x]['start']);
						starttime = new Date(starttime.getTime() + (starttime.getTimezoneOffset() * 60000));
						
						var endtime = info[x]['end']; // convert from iso format
						if (endtime != null) {
							endtime = new Date(endtime);
							endtime = new Date(endtime.getTime() + (endtime.getTimezoneOffset() * 60000));
						} else {
							endtime = starttime;
						}
						
						// todo: support for multi-day events
						// check if start time is within this block
						if (starttime.getDay() == (i + dayOffset)%7 ) {
							// it is today, is it this time?
							var curTime = j*timeStep + timeStart; // this will be something like 13.5
							var startNum = starttime.getHours() + (starttime.getMinutes()/60.0);
							var endNum = endtime.getHours() + (endtime.getMinutes()/60.0);
							
							if (startNum >= curTime && startNum < curTime + 0.5) {
								// event starts in this block
								events[i][j].push(info[x]['type'] + info[x]['name']);
								added = true;
							} else if (endNum < curTime && endNum > curTime - 0.5) {
								// event ends in this block
								events[i][j].push(info[x]['type'] + info[x]['name']);
								added = true;
							} else if (curTime > startNum && curTime < endNum) {
								// event spans this block
								events[i][j].push(info[x]['type'] + info[x]['name']);
								added = true;
							}
						}
					}
				}
			}
			buildCalendar(events);
		} else {
			alert("Error updating calendar, please try again");
		}
	});
}

function buildCalendar(data) {
	var timeStart = 6;
	var timeEnd = 23;
	var timeStep = 0.5;
	
	// todo: look up JS time functions
	var daysOfWeek = [];
	var d = new Date();
	var curDay = d.getDay();
	
	for (var dn = curDay; dn < curDay+7; dn++) {
		var dayStr;
		switch (dn%7) {
			case 0: dayStr = "Sunday"; break;
			case 1: dayStr = "Monday"; break;
			case 2: dayStr = "Tuesday"; break;
			case 3: dayStr = "Wednesday"; break;
			case 4: dayStr = "Thursday"; break;
			case 5: dayStr = "Friday"; break;
			case 6: dayStr = "Saturday"; break;
		}
		daysOfWeek.push(dayStr);
	}
	
	if (data == null) {
		// build blank calendar
		/* day:
			timeslot:
				events: #event1, #event2, ...
		where # is either 0 for event or 1 for task
		*/
		data = [];
		for (var a=0; a<daysOfWeek.length; a++) {
			var temp = [];
			for (var b=timeStart;b<=timeEnd;b+=timeStep) {
				var dayevts = []; // list of events for the day
				//dayevts.push("0x="+a);
				//dayevts.push("1y="+b);
				temp.push(dayevts);
			}
			data.push(temp);
		}
	}
	
	//statusDisplay.innerHTML = data;
	
	var caldiv = document.getElementById("caltable");
	var cal = document.createElement("table");
	
	// create header row
	row = document.createElement("tr");
	row.setAttribute("class", "top");
	col = document.createElement("th");
	row.appendChild(col);
	for (var i=0;i<daysOfWeek.length;i++) {
		col = document.createElement("th");
		col.innerHTML = daysOfWeek[i];
		row.appendChild(col);
	}
	cal.appendChild(row);
	
	// create inner rows
	reali=0;
	for (var i=timeStart; i<=timeEnd; i+=timeStep) {
		row = document.createElement("tr");
		
		// time label
		col = document.createElement("th");
		col.innerHTML = getTimeStamp(i); // todo: actual time stamp
		row.appendChild(col);
		
		// actual calendar slots
		for (var j = 0; j < daysOfWeek.length; j++) {
			col = document.createElement("td");
			for (var n=0;n<data[j][reali].length;n++) {
				var type = data[j][reali][n].charAt(0);
				// todo: delete functions
				if (type == "1") // task
					col.innerHTML += "<span class='task'>"+ data[j][reali][n].substr(1)+"</span><br />";
				else if (type == "2") // schedule
					col.innerHTML += "<span class='sched'>Work on: "+ data[j][reali][n].substr(1)+"</span><br />";
				else // event
					col.innerHTML += "<span class='event'>"+ data[j][reali][n].substr(1)+"</span><br />";
			}
			row.appendChild(col);
		}
		cal.appendChild(row);
		reali++;
	}
	
	if (data != null) {
		statusDisplay.innerHTML += ", has data,";
	}
	
	// remove old calendar
	if (caldiv.hasChildNodes()) {
		for (var i=0;i<caldiv.childNodes.length;i++)
			caldiv.removeChild(caldiv.firstChild);
	}
	caldiv.appendChild(cal);
	
	statusDisplay.innerHTML += " doneneee";
}

function populateUserPrefs() {
	$.post("http://127.0.0.1:8000/Logger", "1getuserprefs",
	function(data,status){
		//alert("Data: " + data + "\nStatus: " + status);
		var userform = document.getElementById("userInfo");
		var info = JSON.parse(data);
		
		document.getElementById("username").value = info["name"];
		document.getElementById("userage").value = info["age"];
		document.getElementById("gender"+info["gender"]).checked = true;
		
		if (info["worktime"])
			document.getElementById("workTime").value = info["worktime"];
		
		if (info["resttime"])
			document.getElementById("restTime").value = info["resttime"];
		
		statusDisplay.innerHTML = "prefspersfpsfps";
		username = info["name"];
		document.getElementById("greeting").innerHTML = "Welcome back, "+username+"!";
	});
}

// convert a number 0 - 24 into its hour format.. hack
function getTimeStamp(num) {
	if (num.toString().indexOf('.') < 0)
		return num.toString()+":00";
	return num.toString().replace(".5",":30");
}

// When the popup HTML has loaded - set up page
window.addEventListener('load', function(evt) {
    // store reference to div
    statusDisplay = document.getElementById('status');
	
	// bind form functions
    document.getElementById("calendarinfo").addEventListener("submit", calendarUpdate);
    document.getElementById("userinfo").addEventListener("submit", userUpdate);
	document.getElementById("taskinfo").addEventListener("submit", taskUpdate);
	document.getElementById("eventinfo").addEventListener("submit", eventUpdate);
	
	// add links to tabs
	document.getElementById("calendarLink").onclick = function() { tabSwitch("calendar"); };
	document.getElementById("preferencesLink").onclick = function() { tabSwitch("preferences"); };
	document.getElementById("neweventLink").onclick = function() { tabSwitch("newevent"); };
	document.getElementById("newtaskLink").onclick = function() { tabSwitch("newtask"); };

	tabSwitch("calendar");
	
	buildCalendar(null);
	populateUserPrefs();
});