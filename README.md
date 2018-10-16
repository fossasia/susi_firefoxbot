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

Susi is an artificial intelligence combining pattern matching, internet data, data flow principles and inference engine principles. It has reflection abilities and it will be able to remember the user's input to produce deductions and a personalized feedback. Its purpose is to explore the abilities of an artificial companion and to answer the remaining unanswered questions.

### Why susi_firefoxbot

We noticed that users don't want to open susi web chat every time and would prefer to interact with SUSI while staying on the current tab. So, we figured that a web extension will solve this problem.

## Installation

```sh
$ git clone https://github.com/fossasia/susi_firefoxbot
$ cd susi_firefoxbot
$ cd src
```

1. Clone this repository.
2. Open `about:debugging` on Mozilla Firefox.
3. Enable add-on debugging.
4. Load temporary-addon from `src` folder.
5. You will see an icon on the firefox's toolbar.
6. Click on the icon and start interacting with SUSI.

## How to publish or submit your add-on to AMO(https://addons.mozilla.org/)
1. before we publish our add-on, we need to pack our add-on as a file, please check (https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) to install web-ext, or simply type on your terminal or command line:
   npm install --global web-ext

2. go to the folder of your add-on with manifest.json, in this case, we should go to "susi_firefoxbot/src/", test our add-on by typing:
   web-ext run

3. if succeeded, firefox will be opened, and your add-on is shown on the tray of add-on, you can test all function of your add-on in real Firefox.  

4. to pack your add-on as a file, try to type:
    web-ext build

5. when "Your web extension is ready: " show up, your add-on is worked and ready to use. the file name and version of "susi_chatbot-1.0.zip" is determined by manifest.json, remember to modify manifest.json when version changed


6. go to https://addons.mozilla.org/en-US/firefox/ and register your AMO account.

7. click "Developer Hub" at up-right, then select "Summit your first Add-on" or "Summit a New Add-on"

8. at "How to Distribute this Version", choose "On this site" to make your Firefox Add-on to the public, or choose "On your own" to make this add-on private. now we choose "On your own" for our test project.

9. at "Upload Version", select the packed file at "susi_firefoxbot/src/web-ext-artifacts/susi_chatbot-1.0.zip" to upload. originally, firefox's add-on support *.xpi, but now AMO can support *.xpi and *.zip.

10. AMO will check and verify your add-on, it will tell you when the error happened. otherwise, you should get the success message like: "Your add-on was validated with no errors and xx warnings. Your submission will be automatically signed." 

11. if no problem, check support platform at "which platforms are this file compatible with", the default is All Platforms.

12. click [Sign Add-on], your add-on will be signed, and you can download your add-on: "susi_chatbot-1.0-an+fx.xpi" to backup or send it to your friends, 

13. if you select "On this site" at step 8. , please describe your add-on with more detail information, and click [Sumbmit Version], your add-on will publish to global immediately, everyone can search your addon at AMO search bar


