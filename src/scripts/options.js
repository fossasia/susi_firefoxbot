/* global $ */
/*global messagesHistory, enableSync, applyTheme, userMapObj, htmlMsg*/
var settings = document.getElementById("settings");
var clearMessageHistoryButton = document.getElementById("clearMessageHistory");
var loginForm = document.getElementById("login");
var logoutButton = document.getElementById("logout");
var loginButton = document.getElementById("login");
var accessToken = "";
var time = "" ;
var BASE_URL = "https://api.susi.ai";
var messagesHistory=[];
var userMapObj={latitude:null,longitude:null,status:null,mapids:[]};

settings.addEventListener("submit", saveOptions);
loginButton.addEventListener("submit", login);
logoutButton.addEventListener("click", logout);
clearMessageHistoryButton.addEventListener("click", clearMessageHistory);

document.addEventListener("DOMContentLoaded", persistSettings);

function login(event){
	event.preventDefault();
	var email=document.getElementById("username").value;
	var loginEndPoint = BASE_URL+"/aaa/login.json?type=access-token&login="
			+ encodeURIComponent(email)
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
				browser.storage.sync.set({
					loggedUser:{
						email:email,
						accessToken: accessToken
					}
				});
				time = response.valid_seconds;
				alert(response.message);
				applyUserSettings();
				retrieveUserChatHistory();
				loginForm.style.display="none";
				logoutButton.style.display="block";
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
function logout(){
	browser.storage.sync.remove("messagesHistory");
	browser.storage.sync.remove("userMapObj");
	browser.storage.sync.remove("loggedUser");
	loginForm.style.display="block";
	logoutButton.style.display="none";
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
			if(res["theme"]=="dark"){
				$("#theme").val("dark");
			}
			else{
				$("#theme").val("light");
			}
		}
		if(res["loggedUser"]){
			loginForm.style.display="none";
			logoutButton.style.display="block";
		}
		else{
			loginForm.style.display="block";
			logoutButton.style.display="none";
		}
		if(res["serverOpt"]) {
			$("input[name=serverOption]").val([res["serverOpt"]]);
			if(res["serverOpt"] === "custom") {
				$("#customServer").val(res["serverName"]);
			}
		}

	});
}


function saveOptions(e) {
	e.preventDefault();
	var selectedServer = "";
	var selectedServerOpt = $("input[name=serverOption]:checked").val();
	if (selectedServerOpt === "default") {
		selectedServer = "https://api.susi.ai";
		$("#customServer").val("");
	} else {
		selectedServer = $("#customServer").val();
	}
	browser.storage.sync.set({
		theme: document.querySelector("#theme").value,
		serverOpt: selectedServerOpt,
		serverName: selectedServer
	});

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
