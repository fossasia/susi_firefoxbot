/* global $ */
/*global messagesHistory, enableSync, applyTheme, userMapObj, htmlMsg*/
var themeSelect = document.getElementById("theme");
var topBarColorSelect = document.getElementById("top-bar-color");
var messagePaneColorSelect = document.getElementById("message-pane-color");
var clearMessageHistoryButton = document.getElementById("clearMessageHistory");
var loginForm = document.getElementById("login");
var logoutButton = document.getElementById("logout");
var loginButton = document.getElementById("loginbutton");
var noLoggedInBlock = document.getElementById("nologgedin");
var loggedInBlock = document.getElementById("loggedin");
var changePasswordForm = document.getElementById("changepasswordform");
var showLoginButton = document.getElementById("login-show-button");
var loginContainer = document.getElementById("login-container");
var hideLoginButton = document.getElementById("login-hide-button");
var showChangePassButton = document.getElementById("change-pass-show-button");
var changePassContainer = document.getElementById("change-pass-container");
var hideChangePassButton = document.getElementById("change-pass-hide-button");
var accessToken = "";
var userEmail = "";
var time = "" ;
var BASE_URL = "https://api.susi.ai";
var messagesHistory=[];
var userMapObj={latitude:null,longitude:null,status:null,mapids:[]};
var passwordLim = document.getElementById("passwordlim");
var passwordNew = document.getElementById("passwordnew");
var toggle = document.getElementById("toggle");
var pass = document.getElementById("password");
var mail = document.getElementById("username");

themeSelect.addEventListener("change", saveOptions);
topBarColorSelect.addEventListener("change", saveOptions);
messagePaneColorSelect.addEventListener("change", saveOptions);
loginForm.addEventListener("submit", login);
changePasswordForm.addEventListener("submit", handleChangePassword);
logoutButton.addEventListener("click", logout);
clearMessageHistoryButton.addEventListener("click", clearMessageHistory);

showLoginButton.addEventListener("click", showLoginForm);
hideLoginButton.addEventListener("click", hideLoginForm);
showChangePassButton.addEventListener("click", showChangePassForm);
hideChangePassButton.addEventListener("click", hideChangePassForm);

document.addEventListener("DOMContentLoaded", persistSettings);

function showLoginForm(){
	showLoginButton.style.display="none";
	loginContainer.style.display="block";
	hideLoginButton.style.display="block";

}

function hideLoginForm(){
	showLoginButton.style.display="block";
	loginContainer.style.display="none";
	hideLoginButton.style.display="none";

}

function showChangePassForm(){
	showChangePassButton.style.display="none";
	changePassContainer.style.display="block";
	hideChangePassButton.style.display="block";

}

function hideChangePassForm(){
	showChangePassButton.style.display="block";
	changePassContainer.style.display="none";
	hideChangePassButton.style.display="none";

}

function showLoggedInBlock(show){
	if(show){
		noLoggedInBlock.style.display="none";
		loggedInBlock.style.display="block";
		document.getElementById("passwordchange").value="";
		document.getElementById("passwordnewconfirm").value = "";
		document.getElementById("passwordnew").value = "";
	}
	else{
		noLoggedInBlock.style.display="block";
		loggedInBlock.style.display="none";
		document.getElementById("username").value = "";
		document.getElementById("password").value = "";
	}
}

function login(event){
	event.preventDefault();
	var email=document.getElementById("username").value;
	var password=document.getElementById("password").value;
	if(!email){
		alert("Email can't be blank");
		return;
	}
	else if(!password){
		alert("Password can't be blank");
		return;
	}
	loginButton.innerHTML="<i class='fa fa-spinner fa-spin fa-2x fa-fw'></i>";
	var loginEndPoint = BASE_URL+"/aaa/login.json?type=access-token&login="
			+ encodeURIComponent(email)
			+ "&password="
			+ encodeURIComponent(password);
	$.ajax({
		url: loginEndPoint,
		dataType: "jsonp",
		jsonpCallback: "p",
		jsonp: "callback",
		crossDomain: true,
		success: function (response) {
			if(response.accepted){
				accessToken = response.access_token;
				userEmail = email;
				browser.storage.sync.set({
					loggedUser:{
						email:email,
						accessToken: accessToken
					}
				});
				time = response.valid_seconds;
				loginButton.innerHTML="Login";
				alert(response.message);
				applyUserSettings();
				retrieveUserChatHistory();
				showLoggedInBlock(true);
			}
			else {
				alert("Login Failed. Try Again");
			}
		},
		error: function ( jqXHR, textStatus, errorThrown) {
			loginButton.innerHTML="Login";
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
function handleChangePassword(event){
	event.preventDefault();
	var changepasswordsubmitButton = document.getElementById("changepasswordsubmit");
	var password=document.getElementById("passwordchange").value;
	var newpassword = document.getElementById("passwordnew").value;
	var passwordnewconfirm = document.getElementById("passwordnewconfirm").value;
	if(!password || !newpassword || !passwordnewconfirm){
		alert("Please fill all the fields");
		return;
	}
	if(newpassword !==passwordnewconfirm){
		alert("Confirm password should match");
		return;
	}
	if(password === newpassword){
		alert("Your current password matches new password.");
		return;
	}
	changepasswordsubmitButton.innerHTML="<i class='fa fa-spinner fa-spin fa-2x fa-fw'></i>";
	var passwordChangeEndPoint = BASE_URL+"/aaa/changepassword.json?changepassword="
			+ userEmail
			+ "&password="
			+ encodeURIComponent(password)
			+ "&newpassword="
			+ encodeURIComponent(newpassword)
			+ "&access_token="
			+ accessToken;
	$.ajax({
		url: passwordChangeEndPoint,
		dataType: "jsonp",
		jsonpCallback: "p",
		jsonp: "callback",
		crossDomain: true,
		success: function (response) {
			changepasswordsubmitButton.innerHTML="Change Password";
			if(response.accepted){
				logout();
				alert(response.message + " Please login again");
			}
			else {
				if(response.message)
					alert(response.message);
				else
					alert("Changing Password Failed. Try Again");
			}
		},
		error: function ( jqXHR, textStatus, errorThrown) {
			changepasswordsubmitButton.innerHTML="Change Password";
			var msg = "";
			var jsonValue =  jqXHR.status;
			if (jsonValue === 404) {
				msg = "Changing Password Failed. Try Again";
			}
			else {
				msg = "Some error occurred. Try Again";
			}
			if (status === "timeout") {
				msg = "Please check your internet connection";
			}
			if(jqXHR.message){
				msg = jqXHR.message;
			}
			alert(msg);
		}
	});

}

function logout(){
	browser.storage.sync.remove("messagesHistory");
	browser.storage.sync.remove("userMapObj");
	browser.storage.sync.remove("loggedUser");
	accessToken = "";
	showLoggedInBlock(false);
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
					theme: response.settings.theme,
					topBarColor: response.settings.topBarColor,
					messagePaneColor: response.settings.messagePaneColor
				});
			}

		}
	});

}


function retrieveUserChatHistory(){
	var chatHistory = BASE_URL+"/susi/memory.json?access_token="+accessToken;
	$.ajax({
		url: chatHistory,
		dataType: "jsonp",
		jsonpCallback: "q",
		jsonp: "callback",
		crossDomain: true,
		success: function (response) {
			browser.storage.sync.remove("messagesHistory");
			browser.storage.sync.remove("userMapObj");
			for(var i = response.cognitions.length-1 ; i >= 0 ; i--){
				var queryResponsePair = response.cognitions[i];
				var queryDate = new Date(Date.parse(queryResponsePair.query_date));
				var answerDate = new Date(Date.parse(queryResponsePair.answer_date));
				createMyMessageHistory(queryResponsePair.query, queryDate.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"}), messagesHistory.length);
				if(queryResponsePair.answers.length>0){
					createSusiMessageHistory(queryResponsePair, answerDate.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"}), messagesHistory.length);
				}
			}
		}
	});
}


function clearMessageHistory(){
	var isConfirm = confirm("Are you sure? This cannot be undone.");
	if(isConfirm == true){
		//clears messages stored in browser
		browser.storage.sync.remove("messagesHistory");
		browser.storage.sync.remove("userMapObj");
	}
}

function persistSettings(){
	var buffer = browser.storage.sync.get(null);
	buffer.then(function(res){
		if(res["theme"]){
			$("#theme").val(res["theme"]);
			if(res["theme"] != "custom"){
				$("#top-bar-color").prop("disabled", true);
				$("#message-pane-color").prop("disabled", true);
			}
		}
		if(res["topBarColor"]){
			$("#top-bar-color").val(res["topBarColor"]);
		}
		if(res["messagePaneColor"]) {
			$("#message-pane-color").val(res["messagePaneColor"]);
		}
		if(res["loggedUser"]){
			accessToken = res["loggedUser"].accessToken;
			userEmail = res["loggedUser"].email;
			showLoggedInBlock(true);
		}
		else{
			showLoggedInBlock(false);
		}

	});
}


function saveOptions(e) {
	e.preventDefault();
	var nameOfSettingsChanged = e.target.name;
	if(nameOfSettingsChanged === "theme"){
		// locally change the theme value
		var selectedtheme = document.querySelector("#theme").value;
		browser.storage.sync.set({
			theme: selectedtheme
		});

		if(selectedtheme !== "custom"){
			topBarColorSelect.disabled = true;
			messagePaneColorSelect.disabled = true;
		}
		else {
			topBarColorSelect.disabled = false;
			messagePaneColorSelect.disabled = false;
		}

		//check if user is logged in
		if(accessToken != ""){
			var themeUrl = BASE_URL+"/aaa/changeUserSettings.json?key1=theme&value1="+selectedtheme+"&access_token="+accessToken+"&count=1";

			// fire the api call to change settings value on server
			$.ajax({
				url: themeUrl,
				dataType: "jsonp",
				jsonpCallback: "q",
				jsonp: "callback",
				crossDomain: true,
				success: function (response) {
					alert("Theme updated successfuly.");
				}
			});
		}
	}
	else if (nameOfSettingsChanged === "top-bar-color") {
		var selectedTopBarColor = document.querySelector("#top-bar-color").value;
		browser.storage.sync.set({
			topBarColor: selectedTopBarColor
		});

		//check if user is logged in
		if (accessToken != "") {
			var topBarUrl = BASE_URL + "/aaa/changeUserSettings.json?key1=topBarColor&value1=" + selectedTopBarColor +
				"&access_token=" + accessToken + "&count=1";

			// fire the api call to change settings value on server
			$.ajax({
				url: topBarUrl,
				dataType: "jsonp",
				jsonpCallback: "q",
				jsonp: "callback",
				crossDomain: true,
				success: function (response) {
					alert("Top bar color updated successfuly.");
				}
			});
		}
	}
	else if (nameOfSettingsChanged === "message-pane-color") {
		var selectedMessagePaneColor = document.querySelector("#message-pane-color").value;
		browser.storage.sync.set({
			messagePaneColor: selectedMessagePaneColor
		});

		//check if user is logged in
		if (accessToken != "") {
			var messagePaneUrl = BASE_URL + "/aaa/changeUserSettings.json?key1=messagePaneColor&value1=" + selectedMessagePaneColor +
				"&access_token=" + accessToken + "&count=1";

			// fire the api call to change settings value on server
			$.ajax({
				url: messagePaneUrl,
				dataType: "jsonp",
				jsonpCallback: "q",
				jsonp: "callback",
				crossDomain: true,
				success: function (response) {
					alert("Message pane color updated successfuly.");
				}
			});
		}
	}
}


function createMyMessageHistory(message,timeString,msgId){
	var htmlMsg="<div class='message-container message-container-my' id='myMessage"+msgId+"'> \
	<div class='message-box message-my'> \
		<div class='message-text'>"+message+"</div> \
		<div class='message-time'>"+timeString+"</div> \
	</div> \
	</div>";
	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
}

function createSusiMessageHistory(data,timeString,msgId){
	var actions=data.answers[0].actions;
	for(var action_index = 0;action_index<actions.length;action_index++){
		var action=actions[action_index];
		var type=action.type;
		var answers=[];
		var count=0;
		var expression="";
		if(type==="answer"){
			expression=action.expression;
			if(expression){
				createSusiMessageAnswerHistory(expression,timeString,msgId);
			}
		}
		else if(type==="anchor"){
			var text=action.text;
			var link=action.link;
			createSusiMessageAnchorHistory(text,link,timeString,msgId);
			applyTheme();
		}
		else if(type==="rss"){
			answers=data.answers[0].data;
			count = action.count;
			createSusiMessageRssHistory(answers,count,timeString,msgId);
			applyTheme();
		}
		else if(type==="websearch"){
			answers=data.answers[0].data;
			count = action.count;
			createSusiMessageRssHistory(answers,count,timeString,msgId);
			applyTheme();
		}
		else if(type==="table"){
			expression="table";
			var tableData = data.answers[0].data;
			var columns = Object.keys(action.columns);
			var columnsData = Object.values(action.columns);
			createSusiMessageTableHistory(tableData,columns,columnsData,timeString,msgId);
			applyTheme();
		}
		else if(type==="map"){
			var latitude=action.latitude;
			var longitude=action.longitude;
			var zoom=action.zoom;
			createSusiMessageMapHistory(latitude,longitude,zoom,timeString,msgId);
			applyTheme();
		}
		else{
			// add support for duckduckgo search
			expression="unable to fetch";
			createSusiMessageAnswerHistory(expression,timeString,msgId);
			applyTheme();
		}
	}
}



function createSusiMessageAnswerHistory(message,timeString,msgId_susi){
	message=message.replace(/https?:[/|.|\w]*/gi,function composeLink(link){
		return "<a href='"+link+"' target='_blank'>"+link+"</a>";
	});
	var htmlMsg="<div class='message-box-susi message-susi'> \
<div class='message-text'>"+message+"</div> \
<div class='message-time'>"+timeString+"</div> \
</div>";
	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
}

function createSusiMessageAnchorHistory(text,link,timeString,msgId_susi){
	var htmlMsg="<div class='message-box-susi message-susi'> \
<div class='message-text'>"+"<a href='"+link+"' target='_blank'>"+text+"</a>"+"</div> \
<div class='message-time'>"+timeString+"</div> \
</div>";
	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
}
function createSusiMessageMapHistory(latitude,longitude,zoom,timeString,msgId_susi){
	var mapid="map"+msgId_susi;
	var maphtml="<div class='map-div' id='"+mapid+"'></div>";
	var htmlMsg="<div class='message-box-susi message-susi'> \
<div class='message-text'>"+maphtml+"</div> \
<div class='message-time'>"+timeString+"</div> \
</div>";
	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
	var mapObj={
		msgId:mapid,
		latitude:latitude,
		longitude:longitude,
		zoom:zoom
	};
	userMapObj.mapids.push(mapObj);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory,"userMapObj":userMapObj});
	}
}

function createSusiMessageTableHistory(tableData,columns,columnsData,timeString,msgId_susi){
	var table = "<table><tbody><tr>";
	var i = 0 ;
	var j =0 ;

	//create headers for the table
	for(i = 0 ; i < columnsData.length ; i++){
		table = table.concat("<th>"+columnsData[i]+"</th>");

	}
	table =table.concat("</tr>");

	for(i = 0 ; i < tableData.length ; i++){
		table = table.concat("<tr>");

		for(j= 0; j < columns.length ;  j++){
			//check if such column value exists for that record
			if(tableData[i][columns[j]]){
				var cellData  = tableData[i][columns[j]];
				cellData.replace(/https?:[/|.|\w]*/gi,function composeLink(link){
					cellData="<a href='"+cellData+"' target='_blank'>"+cellData+"</a>";
				});

				table = table.concat("<td>"+cellData + "</td>" );
			}
		}

		table = table.concat("</tr>");

	}

	table =table.concat("</tbody></table>");

	var htmlMsg="<div class='message-box-susi message-susi'> \
	<div class='table-view'>"+table+"</div> \
	<div class='message-time'>"+timeString+"</div> \
	</div>";

	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}

}


function createSusiMessageRssHistory(answers,count,currentTimeString,msgId){
	var rssHtml=$("<div class='content-slick' id=contentSlick"+msgId+"> \
	</div> \
	");
	rssHtml=rssHtml[0];
	var i=0;
	var included=0;
	while(included!==count && i<answers.length){
		var answer=answers[i];
		var title=answer.title?answer.title:"";
		var description=answer.description?answer.description:"";
		var link=answer.link?answer.link:"";
		if(answer.image || (included===0 && i===answers.length-1)) {
			included++;
			var image=answer.image?answer.image:"";
			$("<a target='_blank' class='anchor' href='"+link+"'><div class='card-slick'> \
		<img src="+image+" /> \
		<h4 class='title'>"+title+"</h4> \
		<p class='description'>"+description+"</p>\
		<span class='domain'>"+urlDomain(link)+"</span> \
	</div></a>").appendTo(rssHtml);
		}
		i++;
	}
	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
	// initialize slick slider
	$("#contentSlick"+msgId).slick({
		slidesToShow:1,
		centerMode:true,
		centerPadding:"20px",
		arrows:true,
		dots:false,
		infinite:true,
		dotsClass:"slick-dots slick-dots-ul",

	});

}

function urlDomain(data) {
	var a = document.createElement("a");
	a.href = data;
	return a.hostname;
}

passwordNew.addEventListener("keyup", function () {
	if(passwordNew.value.length<6){
		passwordLim.removeAttribute("hidden");
		document.getElementById("changepasswordsubmit").setAttribute("disabled", "true");
	}
	else {
		passwordLim.setAttribute("hidden", "true");
		document.getElementById("changepasswordsubmit").removeAttribute("disabled");
	}
});

toggle.addEventListener("click", function () {
	toggle.classList.toggle("fa-eye");
	toggle.classList.toggle("fa-eye-slash");
	if (toggle.classList.contains("fa-eye-slash")) {
		pass.type = "password";
	}
	else {
		pass.type = "text";
	}
});

mail.addEventListener("keyup", function () {
	var email=mail.value;
	var isEmailValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
	if(!isEmailValid){
		document.getElementById("emailWarning").style.display="block";
		return;
	}
	else{
		document.getElementById("emailWarning").style.display="none";
		return;
	}
});
