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
$ git clone https://github.com/tstreamDOTh/susi_firefoxbot
$ cd susi_firefoxbot
$ cd src
```

1. Clone this repository.
2. Open `about:debugging` on mozzila firefox.
3. Enable add-on debugging.
4. Load temporary-addon from `src` folder.
5. You will see an icon on the firefox's toolbar.
6. Click on the icon and start interacting with SUSI.

