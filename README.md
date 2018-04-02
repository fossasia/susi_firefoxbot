# susi_firefoxbot

SUSI.AI Firefox Extension
[![Join the chat at https://gitter.im/fossasia/susi_server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/fossasia/susi_server)
[![Build Status](https://travis-ci.org/fossasia/susi_firefoxbot.svg?branch=master)](https://travis-ci.org/fossasia/susi_firefoxbot)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/db948e1eb4b2457386ba80388e8390cf)](https://www.codacy.com/app/fossasia/susi_firefoxbot?utm_source=github.com&utm_medium=referral&utm_content=fossasia/susi_firefoxbot&utm_campaign=badger)
![Browser Status](https://badges.herokuapp.com/browsers?firefox=53,55)

![SUSI_FIREFOXBOT_GIF](https://github.com/fossasia/susi_firefoxbot/blob/master/susi_firefoxbot_updated.gif)

## Our Project Objectives

The central objective of this project is to develop a firefox addon for interacting with SUSI AI chatbot using WebExtension APIs.

### What is SUSI

Susi is an artificial intelligence combining pattern matching, internet data, data flow principles and inference engine principles. It has reflection abilities and it will be able to remember the users input to produce deductions and a personalized feed-back. Its purpose is to explore the abilities of an artificial companion and to answer the remaining unanswered questions.

### Why susi_firefoxbot

We noticed that users don't want to open susi web chat everytime and would prefer to interact with SUSI while staying on the current tab. So, we figured that a web extension will solve this problem.

## Installation

```sh
$ git clone https://github.com/fossasia/susi_firefoxbot
$ cd susi_firefoxbot
$ cd src
```

1. Clone this repository.
2. Open `about:debugging` on mozzila firefox.
3. Enable add-on debugging.
4. Load temporary-addon from `src` folder.
5. You will see an icon on the firefox's toolbar.
6. Click on the icon and start interacting with SUSI.

## How to publish or summit your add-on to AMO(https://addons.mozilla.org/)
1. go to https://addons.mozilla.org/en-US/firefox/ and register your account.

2. click "Developer Hub" at up-right, then select "Summit your first Add-on" or "Summit a New Add-on"

3. at "How to Distribute this Version" , choose "On this site" to make your firefox Add-on to public, or choose "On your own" to make this add-on private. 

4. "Upload Version", before you update your add-on, we have to pack your add-on project as a file, like *.xpi or *.zip....., here we use "web-ext" to pack our add-on.

5. check (https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) to install web-ext, or simply type on your terminal or command line mode:
   npm install --global web-ext

6. go to folder of your add-on with manifest.json, in this case, we should go to susi_firefoxbot/src, test our add-on by typing:
   web-ext run

7. if succeeded, firefox will be opened and your add-on is shown on tray of add-on, you can test all function of your add-on in real firefox.  

8. to pack your add-on as a file, try to type:
    web-ext build

9. if build success, you will get a folder:"web-ext-artifacts" and file "susi_chatbot-1.0.zip" will be shown on it. the file name and version of "susi_chatbot-1.0.zip" is determined by manifest.json

10. back to website of upload to AMO(https://addons.mozilla.org/en-US/developers/addon/submit/upload-unlisted)
