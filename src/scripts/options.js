/* global $ */
var settings = document.getElementById("settings");

settings.addEventListener("submit", saveOptions);

document.addEventListener("DOMContentLoaded", persistSettings);

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
