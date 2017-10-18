
// add a context Menu
browser.contextMenus.create({
	id: "search-selection",
	title: "Ask SUSI",
	contexts: ["selection"]
}, onCreated);

function onCreated(){
}

// perform action on clicking a context menu
browser.contextMenus.onClicked.addListener(function(info, tab) {
	switch (info.menuItemId) {
	case "search-selection":
		var txt = info.selectionText;
		browser.storage.local.set({
			"contextQuery":txt
		});
		//supports only firefox 57
		browser.browserAction.openPopup();
		break;
	}
});
