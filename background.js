// https://developer.chrome.com/extensions/history#event-onVisited
// the nice thing about this is that it also lets you know how the person got to the link

chrome.history.onVisited.addListener(visitLogger);

// result is a HistoryItem
function visitLogger(result) {
	alert(result.url);
}