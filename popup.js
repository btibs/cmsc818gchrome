// adapted from http://markashleybell.com/building-a-simple-google-chrome-extension.html

// Global reference to the status display SPAN
var statusDisplay = null;

// Global reference to the current state
// haha this is a state machine woo
var state = 0;

function addBookmark() {
    // Cancel the form submit
    event.preventDefault();
	var name = document.getElementById('username').value;
	var gender = document.querySelector('input[name="gender"]:checked');
	gender = (gender) ? gender.value : '';
	
	statusDisplay.innerHTML = "got results = " + name + ", " + gender;
	
	var userform = document.getElementById("userinfo");
	for (var i=0; i<=userform.childNodes.length; i++)
		userform.removeChild(userform.childNodes[0]);
		
	var tbox = document.createElement("input");
	tbox.name="tester";
	tbox.id="testbox";
	tbox.value="hi testing";
	
	userform.appendChild(tbox);
	
	statusDisplay.innerHTML += ", haha";
	
    /*
	// The URL to POST our data to
    var postUrl = 'http://post-test.markb.com';

    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);

    // Prepare the data to be POSTed
    var title = encodeURIComponent(document.getElementById('title').value);
    var url = encodeURIComponent(document.getElementById('url').value);
    var summary = encodeURIComponent(document.getElementById('summary').value);
    var tags = encodeURIComponent(document.getElementById('tags').value);

    var params = 'title=' + title + 
                 '&url=' + url + 
                 '&summary=' + summary +
                 '&tags=' + tags;

    // Replace any instances of the URLEncoded space char with +
    params = params.replace(/%20/g, '+');

    // Set correct header for form data 
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    // Handle request state change events
    xhr.onreadystatechange = function() { 
        // If the request completed
        if (xhr.readyState == 4) {
            statusDisplay.innerHTML = '';
            if (xhr.status == 200) {
                // If it was a success, close the popup after a short delay
                statusDisplay.innerHTML = 'Saved!';
                window.setTimeout(window.close, 1000);
            } else {
                // Show what went wrong
                statusDisplay.innerHTML = 'Error saving: ' + xhr.statusText;
            }
        }
    };

    // Send the request and set status
    xhr.send(params);
	
    statusDisplay.innerHTML = 'Saving...';
	*/
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Bind our addBookmark function to the form submit event
    document.getElementById('userinfo').addEventListener('submit', addBookmark);
    
	// Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status');
});