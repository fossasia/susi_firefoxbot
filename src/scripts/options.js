/* global $ */
var settings = document.getElementById("settings");
var clearMessageHistoryButton = document.getElementById("clearMessageHistory");
var loginButton = document.getElementById("login");
var accessToken = "";
var time = "" ;
var BASE_URL = "https://api.susi.ai";

settings.addEventListener("submit", saveOptions);
loginButton.addEventListener("submit", login);
clearMessageHistoryButton.addEventListener("click", clearMessageHistory);

document.addEventListener("DOMContentLoaded", persistSettings);

function login(event){
	event.preventDefault();
	var loginEndPoint = BASE_URL+"/aaa/login.json?type=access-token&login="
			+ encodeURIComponent(document.getElementById("username").value)
			+ "&password="
			+ encodeURIComponent(document.getElementById("password").value);
	$.ajax({
		url: loginEndPoint,
		dataType: "jsonp",
		jsonpCallback: "p",
		jsonp: "callback",
		crossDomain: true,
		success: function (response) {
			if(response.accepted){
				accessToken = response.access_token;
				time = response.valid_seconds;
				alert(response.message);
				applyUserSettings();
			}
			else {
				alert("Login Failed. Try Again");
			}
		},
		error: function ( jqXHR, textStatus, errorThrown) {
			var msg = "";
			var jsonValue =  jqXHR.status;
			if (jsonValue === 404) {
				msg = "Login Failed. Try Again";
			}
			else {
				msg = "Some error occurred. Try Again";
			}
			if (status === "timeout") {
				msg = "Please check your internet connection";
			}
			alert(msg);
		}
	});

}

function applyUserSettings(){
	var userSettings = BASE_URL+"/aaa/listUserSettings.json?access_token="+accessToken;
	$.ajax({
		url: userSettings,
		dataType: "jsonp",
		jsonpCallback: "p",
		jsonp: "callback",
		crossDomain: true,
		success: function (response) {
			//persist theme
			if(response.settings.theme){
				browser.storage.sync.set({
					theme: response.settings.theme
				});
			}
					
		}
	});

}

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
