/* global $, L */
var messageFormElement = document.getElementById("messageForm");
var inputMessageElement = document.getElementById("inputMessage");
var messagesHistoryElement = document.getElementById("messagesHistory");
var loggedEmail = document.getElementById("loggedEmail");
var scrollIconBottomElement = document.getElementById("scrollIconBottom");
var scrollIconTopElement = document.getElementById("scrollIconTop");
var topBar = document.getElementById("nav");
var messageCount = 0;
var messagesHistory = [];
var enableSync = true;// set false for testing purpose
var theme = "light"; //default
var topBarColor = "light";
var messagePaneColor = "light";
var settings = document.getElementById("settings");
var seticon = document.getElementById("seticon");
var userMapObj = { latitude: null, longitude: null, status: null, mapids: [] };
var clearchat = document.getElementById("clearchathistory");
var login = document.getElementById("loggedIn");
var logout = document.getElementById("loggedOut");
var numberOfMessagesToLoad = 15;
var isLogged = false;
var accessToken = "";
var emptyHistory = true;
messageFormElement.addEventListener("submit", function (event) {
	event.preventDefault();
	handleMessageInputSubmit();
});
function hideScrollBottomButton() {
	scrollIconBottomElement.style.display = "none";
	scrollIconTopElement.style.display = "block";
}
function showScrollBottomButton() {
	scrollIconTopElement.style.display = "none";
	scrollIconBottomElement.style.display = "block";
}
clearchat.addEventListener("click", clearMessageHistory);

//hide scroll button by default
hideScrollBottomButton();
// initialization based on cache status
var buffer = browser.storage.sync.get(null);
buffer.then(function (res) {
	//to show the logged in email
	if (res["loggedUser"]) {
		topBar.style.height = "14%";
		messagesHistoryElement.style.height = "73%";
		loggedEmail.style.display = "inline";
		loggedEmail.innerText = res["loggedUser"].email;
		isLogged = true;
		accessToken = res["loggedUser"].accessToken;
		document.getElementById("loggedIn").style.display = "none";
		document.getElementById("loggedOut").style.display = "block";

	}
	else {
		topBar.style.height = "12%";
		messagesHistoryElement.style.height = "75%";
		loggedEmail.style.display = "none";
		loggedEmail.innerText = "";
		document.getElementById("loggedIn").style.display = "block";
		document.getElementById("loggedOut").style.display = "none";

	}

});
if (enableSync) {
	//browser.storage.sync.clear();
	//Uncomment the line and run the extension to clear the storage.
	document.addEventListener("DOMContentLoaded", restoreMessages);
	messagesHistoryElement.addEventListener("scroll", handleScroll);
}
else {
	getLocation();
}

settings.addEventListener("click", function () {
	browser.runtime.openOptionsPage();
});

logout.addEventListener("click", function () {
	browser.storage.sync.remove("messagesHistory");
	browser.storage.sync.remove("userMapObj");
	browser.storage.sync.remove("loggedUser");
	accessToken = "";
	document.getElementById("loggedIn").style.display = "block";
	document.getElementById("loggedOut").style.display = "none";
});

login.addEventListener("click", function () {
	browser.runtime.openOptionsPage();
});

seticon.addEventListener("mouseover", function () {
	seticon.src = "images/settings-hover.svg";
});
seticon.addEventListener("mouseout", function () {

	seticon.src = "images/settings.svg";
});

scrollIconTopElement.addEventListener("click", function (e) {
	$(messagesHistoryElement).stop().animate({
		scrollTop: 0
	}, 800);
	e.preventDefault();
});

scrollIconBottomElement.addEventListener("click", function (e) {
	$(messagesHistoryElement).stop().animate({
		scrollTop: $(messagesHistoryElement)[0].scrollHeight
	}, 800);
	e.preventDefault();
});

function handleScroll() {
	var scrollIcon = scrollIconBottomElement;
	var end = messagesHistoryElement.scrollHeight - messagesHistoryElement.scrollTop <= messagesHistoryElement.clientHeight;
	if (end) {
		//hide icon
		hideScrollBottomButton();
	}
	else {
		//show icon
		showScrollBottomButton();
	}
	// retrive history on scrolling
	if (messagesHistoryElement.scrollTop == 0) {
		var startIndex;
		var oldHeight = messagesHistoryElement.scrollHeight;
		var buffer = browser.storage.sync.get(null);
		buffer.then(function (res) {
			if (res["messagesHistory"]) {
				messagesHistory = res["messagesHistory"];
				if (messagesHistoryElement.children.length < messagesHistory.length) {
					startIndex = messagesHistory.length - messagesHistoryElement.children.length - 1;
					var endIndex = startIndex - numberOfMessagesToLoad;
					if (endIndex < 0) {
						endIndex = 0;
					}
					for (var i = startIndex; i >= endIndex; i--) {
						$(messagesHistory[i]).prependTo(messagesHistoryElement);
					}
				}
			}
			applyTheme();
			var newHeight = messagesHistoryElement.scrollHeight;
			messagesHistoryElement.scrollTop = newHeight - oldHeight;
			if (res["userMapObj"]) {
				userMapObj = res["userMapObj"];
				for (var j = 0; j < userMapObj.mapids.length; j++) {
					var mapSingle = userMapObj.mapids[j];
					if ((parseInt(mapSingle.msgId.split("p")[1]) < startIndex) && $("#" + mapSingle.msgId).length > 0) {
						initiateMap(mapSingle.msgId, mapSingle.latitude, mapSingle.longitude, mapSingle.zoom);
					}
				}
			}
			$(".content-slick").slick({
				slidesToShow: 1,
				centerMode: true,
				centerPadding: "20px",
				arrows: true,
				dots: false,
				infinite: true,
				dotsClass: "slick-dots slick-dots-ul",
			});
		});
	}
}



function restoreMessages() {
	var buffer = browser.storage.sync.get(null);
	buffer.then(function (res) {

		if (res["messagesHistory"]) {
			messagesHistory = res["messagesHistory"];

			for (var i = messagesHistory.length - numberOfMessagesToLoad; i < messagesHistory.length; i++) {
				$(messagesHistory[i]).appendTo(messagesHistoryElement);
			}
			$(".content-slick").slick({
				slidesToShow: 1,
				centerMode: true,
				centerPadding: "20px",
				arrows: true,
				dots: false,
				infinite: true,
				dotsClass: "slick-dots slick-dots-ul",

			});
			setTimeout(function () {
				messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;// to apply styles on the dynamic slider
			}, 100);

		}
		else {
			var htmlMsg = "<div class='empty-history'> \
	Start by saying \"Hi\"\
	</div>";
			$(htmlMsg).appendTo(messagesHistoryElement);

		}

		if (res["userMapObj"]) {
			userMapObj = res["userMapObj"];
			for (var j = 0; j < userMapObj.mapids.length; j++) {
				var mapSingle = userMapObj.mapids[j];
				if ($("#" + mapSingle.msgId).length > 0) {
					initiateMap(mapSingle.msgId, mapSingle.latitude, mapSingle.longitude, mapSingle.zoom);
				}
			}
		}
		else {
			getLocation();
		}
		//set the theme
		if (res["theme"]) {
			theme = res["theme"];
			applyTheme();
		}
		if (res["topBarColor"]) {
			topBarColor = res["topBarColor"];
			applyTheme();
		}
		if (res["messagePaneColor"]) {
			messagePaneColor = res["messagePaneColor"];
			applyTheme();
		}
		// extract from local memory
		var bufferLocal = browser.storage.local.get(null);
		bufferLocal.then(function (res) {
			// search for a query selected by Context Menu
			if (res["contextQuery"]) {
				var query = res["contextQuery"];
				inputMessageElement.value = query;
				document.getElementById("inputSubmit").click();
				browser.storage.local.remove("contextQuery");
			}

		});
	});
}

function applyTheme() {
	if (theme == "dark") {
		$(".top-bar").addClass("dark");
		$(".messages-history").addClass("dark");
		$(".message-box").addClass("dark");
		$(".message-box-susi").addClass("dark");
		$(".message-time").addClass("dark");
		$(".input-area").addClass("dark");
		$(".input-message").addClass("dark");
		$(".material-icons").addClass("dark");
	}
	else if (theme == "light") {
		$(".top-bar").removeClass("dark");
		$(".messages-history").removeClass("dark");
		$(".message-box").removeClass("dark");
		$(".message-box-susi").removeClass("dark");
		$(".message-time").removeClass("dark");
		$(".input-area").removeClass("dark");
		$(".input-message").removeClass("dark");
		$(".material-icons").removeClass("dark");
	}
	else {
		if(topBarColor == "dark") {
			$(".top-bar").addClass("dark");
			$(".material-icons").addClass("dark");
		}
		else {
			$(".top-bar").removeClass("dark");
			$(".material-icons").removeClass("dark");

			if(topBarColor != "light") {
				$(".top-bar").css("backgroundColor", topBarColor);
				$(".material-icons").css("color", topBarColor);
			}
		}

		if (messagePaneColor == "dark") {
			$(".messages-history").addClass("dark");
			$(".input-area").addClass("dark");
		}
		else {
			$(".messages-history").removeClass("dark");
			$(".input-area").removeClass("dark");

			if(messagePaneColor != "light") {
				$(".messages-history").css("backgroundColor", messagePaneColor);
				$(".input-area").css("backgroundColor", messagePaneColor);
			}
		}
	}
}

function handleMessageInputSubmit() {
	var message = inputMessageElement.value;
	message = message.trim();
	inputMessageElement.value = "";
	if (message === "") {
		return 0;
	}
	else {
		var currentTimeString = getCurrentTimeString();
		var msgId = messagesHistory.length;
		createMyMessage(message, currentTimeString, msgId);
	}

}

function getCurrentTimeString() {
	var ampm = "AM";
	var currentDate = new Date();
	var hours = currentDate.getHours();
	var minutes = currentDate.getMinutes();
	var time = "";
	if (hours > 12) {
		ampm = "PM";
		hours -= 12;
	}
	if (hours === 12) {
		ampm = "PM";
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	time = hours + ":" + minutes + " " + ampm;
	return time;
}

function initiateMap(id, latitude, longitude, zoom) {
	var map = L.map(id).setView([latitude, longitude], zoom);
	map.scrollWheelZoom.disable();
	map.on("click", function () {
		map.scrollWheelZoom.enable();
	});
	map.on("mouseout", function () {
		map.scrollWheelZoom.disable();
	});

	L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
		attribution: ""
	}).addTo(map);

	L.marker([latitude, longitude]).addTo(map)
		.bindPopup("Here !")
		.openPopup();
}
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		userMapObj.status = "ERROR";
	}
}
function showPosition(position) {
	userMapObj.status = "SUCCESS";
	userMapObj.latitude = position.coords.latitude;
	userMapObj.longitude = position.coords.longitude;
	if (enableSync) {
		browser.storage.sync.set({ "userMapObj": userMapObj });
	}
}

function createMyMessage(message, timeString, msgId) {
	var htmlMsg = "<div class='message-container message-container-my' id='myMessage" + msgId + "'> \
	<div class='message-box message-my'> \
		<div class='message-text'>"+ message + "</div> \
		<div class='message-time'>"+ timeString + "</div> \
	</div> \
	</div>";
	$(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistory.push(htmlMsg);
	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory });
	}
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	applyTheme();
	fetchResponse(message, msgId);
}


function createSusiMessageAnswer(message, timeString, msgId_susi) {
	if (message.match(/.*\.(jpg|png|gif)\b/)) {
		message = message.replace(/.*\.(jpg|png|gif)\b/, function composeImgLink(link) {
			return "<img src='" + link + "'>";
		});
	}
	else {
		message = message.replace(/https?:[/|.|\w]*/gi, function composeLink(link) {
			return "<a href='" + link + "' target='_blank'>" + link + "</a>";
		});
	}

	var htmlMsg = "<div class='message-box-susi message-susi'> \
<div class='message-text'>"+ message + "</div> \
<div class='message-time'>"+ timeString + "</div> \
</div>";
	$("#susiMessage" + msgId_susi).html(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push($("#susiMessage" + msgId_susi).prop("outerHTML"));
	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory });
	}
}


function createSusiMessageVideo(id, website, timeString, msgId_susi) {
	var htmlMsg = "<iframe class='message-box-susi message-susi' width='350' height='200' src='https://www." + website + ".com/embed/" + id + "?autoplay=1'></iframe>";
	$("#susiMessage" + msgId_susi).html(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push($("#susiMessage" + msgId_susi).prop("outerHTML"));
	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory });
	}
}

function createSusiMessageAnchor(text, link, timeString, msgId_susi) {
	var htmlMsg = "<div class='message-box-susi message-susi'> \
<div class='message-text'>"+ "<a href='" + link + "' target='_blank'>" + text + "</a>" + "</div> \
<div class='message-time'>"+ timeString + "</div> \
</div>";
	$("#susiMessage" + msgId_susi).html(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push($("#susiMessage" + msgId_susi).prop("outerHTML"));
	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory });
	}
}
function createSusiMessageMap(latitude, longitude, zoom, timeString, msgId_susi) {
	var mapid = "map" + msgId_susi;
	var maphtml = "<div class='map-div' id='" + mapid + "'></div>";
	var htmlMsg = "<div class='message-box-susi message-susi'> \
<div class='message-text'>"+ maphtml + "</div> \
<div class='message-time'>"+ timeString + "</div> \
</div>";
	$("#susiMessage" + msgId_susi).html(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push($("#susiMessage" + msgId_susi).prop("outerHTML"));
	var mapObj = {
		msgId: mapid,
		latitude: latitude,
		longitude: longitude,
		zoom: zoom
	};
	userMapObj.mapids.push(mapObj);
	initiateMap(mapid, latitude, longitude, zoom);
	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory, "userMapObj": userMapObj });
	}
}

function createSusiMessageTable(tableData, columns, columnsData, timeString, msgId_susi) {
	var table = "<table><tbody><tr>";
	var i = 0;
	var j = 0;

	//create headers for the table
	for (i = 0; i < columnsData.length; i++) {
		table = table.concat("<th>" + columnsData[i] + "</th>");

	}
	table = table.concat("</tr>");

	for (i = 0; i < tableData.length; i++) {
		table = table.concat("<tr>");

		for (j = 0; j < columns.length; j++) {
			//check if such column value exists for that record
			if (tableData[i][columns[j]]) {
				var cellData = tableData[i][columns[j]];
				cellData.replace(/https?:[/|.|\w]*/gi, function composeLink(link) {
					cellData = "<a href='" + cellData + "' target='_blank'>" + cellData + "</a>";
				});

				table = table.concat("<td>" + cellData + "</td>");
			}
		}

		table = table.concat("</tr>");

	}

	table = table.concat("</tbody></table>");

	var htmlMsg = "<div class='message-box-susi message-susi'> \
	<div class='table-view'>"+ table + "</div> \
	<div class='message-time'>"+ timeString + "</div> \
	</div>";

	$("#susiMessage" + msgId_susi).html(htmlMsg).appendTo(messagesHistoryElement);
	messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
	messagesHistory.push($("#susiMessage" + msgId_susi).prop("outerHTML"));

	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory });
	}

}


function createSusiMessageRss(answers, count, currentTimeString, msgId) {
	var rssHtml = $("<div class='content-slick' id=contentSlick" + msgId + "> \
	</div> \
	");
	rssHtml = rssHtml[0];
	var i = 0;
	var included = 0;
	while (included !== count && i < answers.length) {
		var answer = answers[i];
		var title = answer.title ? answer.title : "";
		var description = answer.description ? answer.description : "";
		var link = answer.link ? answer.link : "";
		if (answer.image || (included === 0 && i === answers.length - 1)) {
			included++;
			var image = answer.image ? answer.image : "";
			$("<a target='_blank' class='anchor' href='" + link + "'><div class='card-slick'> \
		<img src="+ image + " /> \
		<h4 class='title'>"+ title + "</h4> \
		<p class='description'>"+ description + "</p>\
		<span class='domain'>"+ urlDomain(link) + "</span> \
	</div></a>").appendTo(rssHtml);
		}
		i++;
	}
	var rssContainer = $(rssHtml).appendTo($("#susiMessage" + msgId));
	messagesHistory.push($("#susiMessage" + msgId).prop("outerHTML"));
	if (enableSync) {
		browser.storage.sync.set({ "messagesHistory": messagesHistory });
	}
	// initialize slick slider
	$("#contentSlick" + msgId).slick({
		slidesToShow: 1,
		centerMode: true,
		centerPadding: "20px",
		arrows: true,
		dots: false,
		infinite: true,
		dotsClass: "slick-dots slick-dots-ul",

	});
	setTimeout(function () {
		messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;// to apply styles on the dynamic slider
	}, 100);

}

// Get hostname for given link
function urlDomain(data) {
	var a = document.createElement("a");
	a.href = data;
	return a.hostname;
}

function showLoading(show, msgId_susi) {
	if (show) {
		// create loading with this msgId_susi
		$(
			"<div class='message-container message-container-susi' id='susiMessage" + msgId_susi + "'> \
      <div class='message-box-susi message-susi'> \
      <div class='message-text'><img src='images/loading.gif' class='loading' /></div> \
      </div> \
    </div>"
		).appendTo(messagesHistoryElement);
		messagesHistoryElement.scrollTop = messagesHistoryElement.scrollHeight;
		applyTheme();
	}
	else {
		// hide loading in this msgId_susi
		$("#susiMessage" + msgId_susi).empty();
	}
}
function fetchResponse(query, msgId) {
	var msgId_susi = msgId;
	var latitude = userMapObj.latitude;
	var longitude = userMapObj.longitude;
	var url = "https://api.susi.ai/susi/chat.json?language=en&timezoneOffset=-300&q=";
	if (userMapObj.status === "SUCCESS") {
		url = "https://api.susi.ai/susi/chat.json?language=en&latitude=" + latitude + "&longitude=" + longitude + "&timezoneOffset=-300&q=";
	}
	url = url + query;
	if (isLogged) {
		url = url + "&access_token=" + accessToken;
	}
	showLoading(true, msgId_susi);
	$.ajax({
		dataType: "jsonp",
		type: "GET",
		url: url,
		error: function (xhr, textStatus, errorThrown) {
			showLoading(false, msgId_susi);
			var response = {
				error: true,
				errorText: "Sorry! request could not be made"
			};
			var currentTimeString = getCurrentTimeString();
			createSusiMessageAnswer(response.errorText, currentTimeString, msgId_susi);
			applyTheme();
		},
		success: function (data) {
			showLoading(false, msgId_susi);
			var currentTimeString = getCurrentTimeString();
			composeResponse(data, currentTimeString, msgId_susi);
		}
	});

}

function composeResponse(data, currentTimeString, msgId_susi) {
	var actions = data.answers[0].actions;
	var msgId = msgId_susi;
	for (var action_index = 0; action_index < actions.length; action_index++) {
		var action = actions[action_index];
		var type = action.type;
		var answers = [];
		var count = 0;
		var expression = "";
		if (action_index !== 0) {
			messageCount++;
			msgId++;// create a new message
			showLoading(true, msgId);
			showLoading(false, msgId);
		}
		if (type === "answer") {
			expression = action.expression;
			if (expression) {
				createSusiMessageAnswer(expression, currentTimeString, msgId);
				applyTheme();
			}
		}

		else if (type === "video_play") {
			createSusiMessageVideo(action.identifier, action.identifier_type, currentTimeString, msgId);
			applyTheme();
		}
		else if (type === "anchor") {
			var text = action.text;
			var link = action.link;
			createSusiMessageAnchor(text, link, currentTimeString, msgId);
			applyTheme();
		}
		else if (type === "rss") {
			answers = data.answers[0].data;
			count = action.count;
			createSusiMessageRss(answers, count, currentTimeString, msgId);
			applyTheme();
		}
		else if (type === "websearch") {
			answers = data.answers[0].data;
			count = action.count;
			createSusiMessageRss(answers, count, currentTimeString, msgId);
			applyTheme();
		}
		else if (type === "table") {
			expression = "table";
			var tableData = data.answers[0].data;
			var columns = Object.keys(action.columns);
			var columnsData = Object.values(action.columns);
			createSusiMessageTable(tableData, columns, columnsData, currentTimeString, msgId);
			applyTheme();
		}
		else if (type === "map") {
			if (userMapObj.status === "SUCCESS") {
				var latitude = action.latitude;
				var longitude = action.longitude;
				var zoom = action.zoom;
				createSusiMessageMap(latitude, longitude, zoom, currentTimeString, msgId);
			}
			else {
				createSusiMessageAnswer("Couldn't show map", currentTimeString, msgId);
			}
			applyTheme();
		}
		else {
			// add support for duckduckgo search
			expression = "unable to fetch";
			createSusiMessageAnswer(expression, currentTimeString, msgId);
			applyTheme();
		}
	}
}

function clearMessageHistory() {

	//clears messages stored in browser
	browser.storage.sync.remove("messagesHistory");
	browser.storage.sync.remove("userMapObj");

}


setTimeout(function () {
	$("#inputMessage").focus();
}, 500);

var toggle = document.getElementById("check");

toggle.addEventListener("click", toggle_theme, false);

function toggle_theme() {
	if (toggle.checked) {
		browser.storage.sync.set({ theme: "dark" });
		theme = "dark";
		applyTheme();
	} 
	else {
		browser.storage.sync.set({ theme: "light" });
		theme = "light";
		applyTheme();
	}
}