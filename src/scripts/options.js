/* global $ */
var settings = document.getElementById("settings");
var clearMessageHistoryButton = document.getElementById("clearMessageHistory");

settings.addEventListener("submit", saveOptions);
clearMessageHistoryButton.addEventListener("click", clearMessageHistory);

document.addEventListener("DOMContentLoaded", persistSettings);

function clearMessageHistory(){
	var isConfirm = confirm("Are you sure? This cannot be undone.");
	if(isConfirm == true){
		//clears messages stored in browser
		browser.storage.sync.clear();
	}
}

function persistSettings(){
	var buffer = browser.storage.sync.get(null);
	buffer.then(function(res){

		if(res["theme"]){
			if(res["theme"]=="dark"){
				$("#theme").val("dark");
			}
			else{
				$("#theme").val("light");
			}
		}

	});
}


function saveOptions(e) {
	e.preventDefault();
	browser.storage.sync.set({
		theme: document.querySelector("#theme").value
	});
  
}
