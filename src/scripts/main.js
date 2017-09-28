/* global $ */
var messageFormElement = document.getElementById("messageForm");
var inputMessageElement = document.getElementById("inputMessage");
var messagesHistoryElement = document.getElementById("messagesHistory");
var messageCount=0;
var messagesHistory=[]; 
messageFormElement.addEventListener("submit", function (event) {
	event.preventDefault();
	handleMessageInputSubmit();
});

document.addEventListener("DOMContentLoaded", restoreMessages);

function restoreMessages(){
	//Uncomment the line below and run the extension to clear the storage.
	//browser.storage.sync.clear();
	var buffer = browser.storage.sync.get(null);
	buffer.then(function(res){
		if(res["messagesHistory"]){
			messagesHistory = res["messagesHistory"];
			var currentTimeString=getCurrentTimeString();
			for(var i = 0  ; i < messagesHistory.length ;  i++){
				if(messagesHistory[i].type === "my"){
					createMyMessageHistory(messagesHistory[i].message , messagesHistory[i].timeStamp , messagesHistory[i].msgId );
				}
				else{
					createSusiMessageHistory(messagesHistory[i].message , messagesHistory[i].timeStamp , messagesHistory[i].msgId );
				}
			}
		}
	});
}

function createMyMessageHistory(message,timeString,msgId){
	$(
		"<div class='message-container message-container-my' id='myMessage"+msgId+"'> \
    <div class='message-box message-my'> \
    <div class='message-text'>"+message+"</div> \
    <div class='message-time'>"+timeString+"</div> \
    </div> \
  </div>"
	).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
}

function createSusiMessageHistory(message,timeString,msgId_susi){
	$(
		"<div class='message-container message-container-susi' id='susiMessage"+msgId_susi+"'> \
    <div class='message-box-susi message-susi'>\
    <div class='message-text'>"+message+"</div> \
    <div class='message-time'>"+timeString+"</div> \
    </div> \
  </div>"
	).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
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
		var msgId=messagesHistory.length+1;
		messagesHistory.push({"message" : message, "msgId" : msgId.toString(), "type" : "my", "timeStamp" : currentTimeString});
		browser.storage.sync.set({"messagesHistory": messagesHistory});
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
	$(
		"<div class='message-container message-container-my' id='myMessage"+msgId+"'> \
    <div class='message-box message-my'> \
    <div class='message-text'>"+message+"</div> \
    <div class='message-time'>"+timeString+"</div> \
    </div> \
  </div>"
	).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	fetchResponse(message,msgId);
}


function createSusiMessage(message,timeString,msgId_susi){
	$("#susiMessage"+msgId_susi).html(
		"<div class='message-box-susi message-susi'> \
    <div class='message-text'>"+message+"</div> \
    <div class='message-time'>"+timeString+"</div> \
  </div>").appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push({"message" : message, "msgId" : msgId_susi.toString(), "type" : "susi", "timeStamp" : timeString});
	browser.storage.sync.set({"messagesHistory": messagesHistory});
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
			createSusiMessage(response, currentTimeString);
		},
		success: function (data) {
			showLoading(false,msgId_susi);
			if (query !== data.answers[0].data[0].query) {
				// return fetchResponse(query,messageCount++);
				// need to implement various type responses
			}
			var response = composeResponse(data);
			var currentTimeString=getCurrentTimeString();
			createSusiMessage(response, currentTimeString, msgId_susi);

		}
	});
}


function composeResponse(data){
	var answer = data.answers[0].data[0].answer;
	/*need to work on different type of responses*/
	return answer;
}

setTimeout(function(){
	$("#inputMessage").focus();
},500);
