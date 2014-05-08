// https://developer.chrome.com/extensions/history#event-onVisited
// http://geniuscarrier.com/log-javascript-to-a-python-httpserver/

if (jQuery) {  
    // jQuery loaded
} else {
    // jQuery not loaded
}

chrome.browserAction.onClicked.addListener(function (tab) { // fired when user clicks browser icon
	chrome.tabs.create({'url': chrome.extension.getURL('popup.html')}, function(tab) {
		// tab opened
	});
});

function GC_Logger() { }
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
function urllog(result) {
	logger.log("0" + result.url);
}

// logging functions
chrome.history.onVisited.addListener(urllog);
