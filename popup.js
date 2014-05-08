// adapted from http://markashleybell.com/building-a-simple-google-chrome-extension.html

// global reference to div
var statusDisplay = null;

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
}

function userUpdate() {
    // cancel the form submit
    event.preventDefault();
	
	// get information from the form
	var name = document.getElementById('username').value;
	var gender = document.querySelector('input[name="gender"]:checked');
	gender = (gender) ? gender.value : '';
	
	//todo additional information
	
	$.post("http://127.0.0.1:8000/Logger",
	{
		3:"input user preferences",
		"name":name,
		"gender":gender
	},
	function(data,status){
		alert("Data: " + data + "\nStatus: " + status);
	});
	
	// display the info TODO REPLACE WITH AJAXING
	statusDisplay.innerHTML = "got results = " + name + ", " + gender;
	
	//todo: clear the form???
}

function taskUpdate() {
	event.preventDefault();
	statusDisplay.innerHTML = "task updated";
	
	$.post("http://127.0.0.1:8000/Logger", "1hello",
	function(data,status){
		alert("Data: " + data + "\nStatus: " + status);
	});
	statusDisplay.innerHTML += "... and posted";
}

function eventUpdate() {
	event.preventDefault();
	statusDisplay.innerHTML = "event updated";
}

function calendarUpdate() {
	event.preventDefault();
	statusDisplay.innerHTML = "calendar updating";
	buildCalendar(null);
}

function buildCalendar(data) {
	var timeStart = 6;
	var timeEnd = 23;
	var timeStep = 0.5;
	
	var caldiv = document.getElementById("calendar");
	var cal = document.createElement("table");
	
	// todo: look up JS time functions
	var daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
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
	for (var i=timeStart; i<=timeEnd; i+=timeStep) {
		row = document.createElement("tr");
		
		// time label
		col = document.createElement("th");
		col.innerHTML = getTimeStamp(i); // todo: actual time stamp
		row.appendChild(col);
		
		// actual calendar slots
		for (var j = 0; j < daysOfWeek.length; j++) {
			col = document.createElement("td");
			//col.innerHTML = ".";
			col.onclick = function() { alert("you clicked!"); };
			row.appendChild(col);
		}
		cal.appendChild(row);
	}
	
	if (data != null) {
		// actually put data in the calendar
		statusDisplay.innerHTML += "data??";
	}
	
	if (caldiv.childNodes.length < 4)
		caldiv.appendChild(cal);
	else {
		statusDisplay.innerHTML += " second try! ";
		caldiv.replaceChild(caldiv.lastChild, cal);
	}
	
	statusDisplay.innerHTML += "doneneee";
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
	/*var navbar = document.getElementById('navbar');
	var links = navbar.getElementsByTagName("a");
	for (var i=0; i < links.length; i++) {
		//var tabName = links[i].getAttribute("id");
		links[i].setAttribute("href", "#");
		links[i].setAttribute("derp", "tabSwitch("+links[i].getAttribute("id")+")");
		links[i].onclick = function() { tabSwitch(links[i].getAttribute("id")); };
	}*/
	// this is the stupid way to do it ugh why wasn't the above working: hoisting
	// set all tabName as preferences at end
	document.getElementById("calendarLink").onclick = function() { tabSwitch("calendar"); };
	document.getElementById("preferencesLink").onclick = function() { tabSwitch("preferences"); };
	document.getElementById("neweventLink").onclick = function() { tabSwitch("newevent"); };
	document.getElementById("newtaskLink").onclick = function() { tabSwitch("newtask"); };
	
	var main = document.getElementById("main");
	var tabs = main.getElementsByTagName("div");
	for (var i=0;i<tabs.length; i++) {
		tabs[i].setAttribute("class", "unselected");
	}
	
	buildCalendar(null);
});