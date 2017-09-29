/* global $ */
var messageFormElement = document.getElementById("messageForm");
var inputMessageElement = document.getElementById("inputMessage");
var messagesHistoryElement = document.getElementById("messagesHistory");
var messageCount=0;
var messagesHistory=[];
var enableSync=true;// set false for testing purpose

messageFormElement.addEventListener("submit", function (event) {
	event.preventDefault();
	handleMessageInputSubmit();
});
if(enableSync){
//browser.storage.sync.clear(); //Uncomment the line below and run the extension to clear the storage.
	document.addEventListener("DOMContentLoaded", restoreMessages);
}
function restoreMessages(){
	var buffer = browser.storage.sync.get(null);
	buffer.then(function(res){
		if(res["messagesHistory"]){
			messagesHistory = res["messagesHistory"];
			for(var i = 0  ; i < messagesHistory.length ;  i++){
				$(messagesHistory[i]).appendTo(messagesHistoryElement);
			}
			$(".content-slick").slick({
				slidesToShow:1,
				centerMode:true,
				centerPadding:"20px",
				arrows:true,
				dots:false,
				infinite:true,
				dotsClass:"slick-dots slick-dots-ul",

			});
			setTimeout(function(){
				messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;// to apply styles on the dynamic slider
			},100);

		}

	});
}

function handleMessageInputSubmit(){
	var message=inputMessageElement.value;
	message=message.trim();
	inputMessageElement.value="";
	if(message===""){
		return 0;
	}
	else{
		var currentTimeString=getCurrentTimeString();
		var msgId=messagesHistory.length;
		createMyMessage(message,currentTimeString,msgId);
	}

}

function getCurrentTimeString() {
	var ampm="AM";
	var currentDate=new Date();
	var hours=currentDate.getHours();
	var minutes=currentDate.getMinutes();
	var time="";
	if(hours>12){
		ampm="PM";
		hours-=12;
	}
	if(hours===12){
		ampm="PM";
	}
	if(minutes<10){
		minutes="0"+minutes;
	}
	time=hours+":"+minutes+" "+ampm;
	return time;
}

function createMyMessage(message,timeString,msgId){
	var htmlMsg="<div class='message-container message-container-my' id='myMessage"+msgId+"'> \
	<div class='message-box message-my'> \
		<div class='message-text'>"+message+"</div> \
		<div class='message-time'>"+timeString+"</div> \
	</div> \
	</div>";
	$(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistory.push(htmlMsg);
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	fetchResponse(message,msgId);
}


function createSusiMessageAnswer(message,timeString,msgId_susi){
	var htmlMsg="<div class='message-box-susi message-susi'> \
<div class='message-text'>"+message+"</div> \
<div class='message-time'>"+timeString+"</div> \
</div>";
	$("#susiMessage"+msgId_susi).html(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push($("#susiMessage"+msgId_susi).prop("outerHTML"));
	if(enableSync){
		browser.storage.sync.set({"messagesHistory": messagesHistory});
	}
}
function createSusiMessageRss(answers,count,currentTimeString,msgId){
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
	var rssContainer = $(rssHtml).appendTo($("#susiMessage"+msgId));
	messagesHistory.push($("#susiMessage"+msgId).prop("outerHTML"));
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
	setTimeout(function(){
		messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;// to apply styles on the dynamic slider
	},100);

}

// Get hostname for given link
function urlDomain(data) {
	var a = document.createElement("a");
	a.href = data;
	return a.hostname;
}

function showLoading(show,msgId_susi){
	if(show){
		// create loading with this msgId_susi
		$(
			"<div class='message-container message-container-susi' id='susiMessage"+msgId_susi+"'> \
      <div class='message-box-susi message-susi'> \
      <div class='message-text'><img src='images/loading.gif' class='loading' /></div> \
      </div> \
    </div>"
		).appendTo(messagesHistoryElement);
		messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	}
	else{
		// hide loading in this msgId_susi
		$("#susiMessage"+msgId_susi).empty();
	}
}
function fetchResponse(query,msgId) {
	var msgId_susi=msgId;
	showLoading(true, msgId_susi);
	$.ajax({
		dataType: "jsonp",
		type: "GET",
		url: "https://api.susi.ai/susi/chat.json?timezoneOffset=-300&q=" + query,
		error: function(xhr,textStatus,errorThrown) {
			showLoading(false,msgId_susi);
			var response = {
				error: true,
				errorText: "Sorry! request could not be made"
			};
			var currentTimeString=getCurrentTimeString();
			createSusiMessageAnswer(response, currentTimeString,msgId_susi);
		},
		success: function (data) {
			showLoading(false,msgId_susi);
			var currentTimeString=getCurrentTimeString();
			composeResponse(data,currentTimeString,msgId_susi);
		}
	});
}

function composeResponse(data,currentTimeString,msgId_susi){
	var actions=data.answers[0].actions;
	var msgId=msgId_susi;
	for(var action_index = 0;action_index<actions.length;action_index++){
		var action=actions[action_index];
		var type=action.type;
		var answers=[];
		var count=0;
		var expression="";
		if(action_index!==0){
			messageCount++;
			msgId++;// create a new message
			showLoading(true,msgId);
			showLoading(false,msgId);
		}
		if(type==="answer"){
			expression=action.expression;
			createSusiMessageAnswer(expression,currentTimeString,msgId);
		}
		else if(type==="rss"){
			answers=data.answers[0].data;
			count = action.count;
			createSusiMessageRss(answers,count,currentTimeString,msgId);
		}
		else if(type==="websearch"){
			answers=data.answers[0].data;
			count = action.count;
			createSusiMessageRss(answers,count,currentTimeString,msgId);
		}
		else{
			// add support for duckduckgo search, maps, tables
			expression="unable to fetch";
			createSusiMessageAnswer(expression,currentTimeString,msgId);
		}
	}
}

setTimeout(function(){
	$("#inputMessage").focus();
},500);
