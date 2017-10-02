/* global $ */
var settings = document.getElementById("settings");

settings.addEventListener("submit", saveOptions);

function saveOptions(e) {
	e.preventDefault();
	browser.storage.sync.set({
		theme: document.querySelector("#theme").value
	});
}
