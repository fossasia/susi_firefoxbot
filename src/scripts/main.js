/* global $ */
var messageFormElement = document.getElementById("messageForm");
var inputMessageElement = document.getElementById("inputMessage");
var messagesHistoryElement = document.getElementById("messagesHistory");

messageFormElement.addEventListener("submit", function (event) {
	event.preventDefault();
	handleMessageInputSubmit();
});

function handleMessageInputSubmit(){
	var message=inputMessageElement.value;
	message=message.trim();
	inputMessageElement.value="";
	if(message===""){
		return 0;
	}
	else{
		var currentTimeString=getCurrentTimeString();
		createMyMessage(message,currentTimeString);
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
	time=hours+":"+minutes+" "+ampm;
	return time;
}

function createMyMessage(message,timeString){
	$(
		"<div class='message-container message-container-my'> \
		<div class='message-box message-my'> \
		<div class='message-text'>"+message+"</div> \
		<div class='message-time'>"+timeString+"</div> \
		</div> \
	</div>"
	).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	fetchResponse(message);
}


function createSusiMessage(message,timeString){
	$(
		"<div class='message-container message-container-susi'> \
		<div class='message-box-susi message-susi'> \
		<div class='message-text'>"+message+"</div> \
		<div class='message-time'>"+timeString+"</div> \
		</div> \
	</div>"
	).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
}


function fetchResponse(query) {
	$.ajax({
		dataType: "jsonp",
		type: "GET",
		url: "https://api.susi.ai/susi/chat.json?timezoneOffset=-300&q=" + query,
		error: function(xhr,textStatus,errorThrown) {
			/*console.log(xhr);
			console.log(textStatus);
			console.log(errorThrown);*/
			var response = {
				error: true,
				errorText: "Sorry! request could not be made"
			};
			var currentTimeString=getCurrentTimeString();
			createSusiMessage(response, currentTimeString);        
		},
		success: function (data) {
			if (query !== data.answers[0].data[0].query) {
				return fetchResponse(query);
			}
			var response = composeResponse(data);
			var currentTimeString=getCurrentTimeString();
			createSusiMessage(response, currentTimeString);
		}
	});
}


function composeResponse(data){
	var answer = data.answers[0].data[0].answer;
	/*need to work on different type of responses*/
	return answer;
}

