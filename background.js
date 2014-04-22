if (jQuery) {  
    // jQuery loaded
	//alert("yay jquery");
} else {
    // jQuery not loaded
	//alert("nnnnnooooooooooooo");
}

// https://developer.chrome.com/extensions/history#event-onVisited
// the nice thing about this is that it also lets you know how the person got to the link

//http://geniuscarrier.com/log-javascript-to-a-python-httpserver/

var padding = " ", index = 0;

function paddedString(str, n) {
    return (str + padding).substr(0, n);
}

function GC_Logger() {
    console.log("======GC_Logger constructor======");
}

GC_Logger.prototype.log = function(module, propertyName, logdata) {
    var time = (new Date()).toLocaleTimeString();
    //var message = paddedString(time, 15) + paddedString(index++, 5) + paddedString(module, 40) + paddedString(propertyName, 20) + logdata + "n";
	var message = logdata;
	
    $.ajax({
        type : "POST",
        url : "http://127.0.0.1:8000/Logger",
        data : message,
        dataType : "text"
    });
};

var logger = new GC_Logger();
logger.log("Window HTML", "Window Init", "Done");

function basiclog(result) {
	logger.log("foo", "bar", result.url);
}

// logging functions
chrome.history.onVisited.addListener(basiclog);

/************************/
function visitLoggerUGH(result) {
	$.ajax({
            url: "http://localhost/cgi-bin/variousTests/tinycgi.py",
            type: "POST",
            data: {foo: 'bar', bar: 'foo'},
            success: function(response){
                    //$("#div").html(response);
					alert("ajax response:"+response);
                }
       });
}

// send a string value to be saved on server
function visitLoggerNope(result) {
    var url = "localhost:8080";
    var params = "content="+result.url;
    
    // create the XMLHttpRequest to send
    // the informations to server
    var http = new XMLHttpRequest();  
    http.open("POST", url, true);

    // send the proper header information
    http.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
    );

    // call the function when the state changes.
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            // it could be alert(http.responseText);
            // but silence
			alert("response: " + http.responseText);
        }
    }

    // send the parameters
    http.send(params);
};

// result is a HistoryItem
function visitLoggerFail(result) {
	//alert(result.url);
	
	// need to send the result to a database somehow
	/*
	ok so apparently you can't actually do this because of security reasons sigh
	you can create a file object in-browser and let the client download but that's it
	ughhhhh gonna have to do a server ughhhhhhhhhhhh
	can still run localhost or maybe django local but this is stupid
	django local python something let's just do that
	http://stackoverflow.com/questions/14778167/return-data-from-html-js-to-python/14778465#14778465
	*/
	var xmlhttp;
	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else { // code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			//document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
			alert("looks ok, sent " + result.url + " to server");
		} else {
			alert(" oh no ");
		}
	}
	xmlhttp.open("GET","form-data",true);
	xmlhttp.send();
}