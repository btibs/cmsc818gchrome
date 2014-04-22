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

function GC_Logger() {
    console.log("======GC_Logger constructor======");
}

GC_Logger.prototype.log = function(logdata) {
    var time = (new Date()).toLocaleTimeString();
    var message = logdata;
	
    $.ajax({
        type : "POST",
        url : "http://127.0.0.1:8000/Logger",
        data : message,
        dataType : "text"
    });
};

var logger = new GC_Logger();

function basiclog(result) {
	logger.log(result.url);
}

// logging functions
chrome.history.onVisited.addListener(basiclog);
