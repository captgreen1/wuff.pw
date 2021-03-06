(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var state = require('../core/state.js');

module.exports.execute = function(args, cb) {
	if(!args || args.length === 0 || !args[0]) {
		$('body').append("This version of cat does not have interactive mode");
		cb();
		return;
	}
	
	var dir = args[0];
	if(dir.indexOf('/') !== 0) {
		dir = state.getCwd() + dir;
	}
	
	$.get('/assets/filesystem' + dir, function(data) {
		while(data.indexOf('\n') !== -1) {
			data = data.replace('\n', '<br />');
		}
		$('body').append(data);
		cb();
	})
}
},{"../core/state.js":8}],2:[function(require,module,exports){
var state = require('../core/state.js');
var fs = require('../core/filesystem.js');

var filesystem;

module.exports.execute = function(args, cb) {
	var dir = args[0];
	
	if(!args || args.length === 0 || !args[0]) {
		dir = state.getCwd();
	}
	
	if(dir.indexOf('/') !== 0) {
		dir = state.getCwd() + dir;
	}
	
	dir = dir.replace('.', state.getCwd());
	
	if(dir.indexOf('..') > -1) {
		var cwd = state.getCwd();
		var dirParts = cwd.split('/');
		if(dirParts[dirParts.length - 1] === "") {
			dirParts = dirParts.splice(0, dirParts.length - 1);
		}
		var pwd = '';
		for(var i = 0; i < dirParts.length - 1; i++) {
			pwd += dirParts[i];
			pwd += '/';
		}
		
		dir = pwd;
	}
	
	fs.getDirectory(dir, function(directory) {
		for(var element in directory.content) {
			$('body').append(element + "&Tab;");
		}
		cb();
	})
}

function actuallyExecute(args, cb) {
	var dir = args[0];
	
	if(!args || args.length === 0 || !args[0]) {
		dir = state.getCwd();
	}
	
	if(dir.indexOf('/') !== 0) {
		dir = state.getCwd() + dir;
	}
	
	var currentContext = filesystem;
	var dirParts = dir.split('/');
	
	for(var dirPart in dirParts) {
		if(dirParts[dirPart] === "") {
			continue;
		}
		if(currentContext.content) {
			currentContext = currentContext.content[dirParts[dirPart]];
		}
		else {
			currentContext = currentContext[dirParts[dirPart]];
		}
	}
	
	for(var element in currentContext.content) {
		$('body').append(element + "&Tab;");
	}
	
	cb();
}
},{"../core/filesystem.js":7,"../core/state.js":8}],3:[function(require,module,exports){
module.exports.execute = function(args, cb) {
	$('body').append('Eww, who uses emacs? Vi master race.');
	cb();
}
},{}],4:[function(require,module,exports){
module.exports.execute = function(args, cb) {
	$('body').append('Currently, the following commands are implemented:')
	$('body').append('<br />')
	$('body').append('&Tab;cat')
	$('body').append('<br />')
	$('body').append('&Tab;dir')
	$('body').append('<br />')
	$('body').append('&Tab;emacs')
	$('body').append('<br />')
	$('body').append('&Tab;whoami')
	$('body').append('<br />')
	$('body').append('&Tab;clear')
	cb();
}
},{}],5:[function(require,module,exports){
module.exports.execute = function(args, cb) {
	$('body').append('wuffy');
	cb();
}
},{}],6:[function(require,module,exports){
var emacs = require('./commands/emacs.js');
var whoami = require('./commands/whoami.js');
var cat = require('./commands/cat.js');
var dir = require('./commands/dir.js');
var help = require('./commands/help.js');

function blinkCursor() {
	if($('.cursor').text() === '|') {
		$('.cursor').text('')
	}
	else {
		$('.cursor').text('|');
	}
	setTimeout(blinkCursor, 500);
}

function handleWeirdCharacters(event) {
	if(event.keyCode === 8) {
		$('.typed-content').text($('.typed-content').text().substring(0, $('.typed-content').text().length - 1));
		event.preventDefault();
	}
}

function printPrompt() {
	$('.typed-content').removeClass("typed-content").addClass("oldContent");
	$('.cursor').remove();
	$('body').append('<span class="blue">{ ~ }</span>');
	$('body').append('<span class="red"> &gt;&gt;</span> ');
	$('body').append('<span class="typed-content"></span>');
	$('body').append('<span class="cursor">|</span>');
	window.scrollTo(0,document.body.scrollHeight);
}

function handleInput(event) {
	//Handles ALL typable keys (Trying to handle then individually was getting... weird.)
	if(event.charCode && event.which !== 13) {
		$('.typed-content').text($('.typed-content').text() + String.fromCharCode(event.charCode));
		return;
	}
	
	if(event.which === 13) {
		var text = $('.typed-content').text();
		var split = text.split(" ");
		var command = split[0];
		var args = split.slice(1, split.length);
		processCommand(command, args);
	}
}

function handleRightClick(event) {
	if(event.button !== 2) {
		return;
	}
	document.execCommand('copy');
}

$(document).ready(function() {
	setTimeout(blinkCursor, 500);
	$('body').keypress(handleInput);
	$('body').keydown(handleWeirdCharacters);
})

function processCommand(command, args) {
	$('body').append('<br />');
	
	switch(command) {
		case '':
			printPrompt();
			break;
		case 'emacs':
			emacs.execute(args, processCommandCallback);
			break;
		case 'whoami':
			whoami.execute(args, processCommandCallback);
			break;
		case 'cat':
			cat.execute(args, processCommandCallback);
			break;
		case 'dir':
			dir.execute(args, processCommandCallback);
			break;
		case 'clear':
			$('body').html('');
			printPrompt();
			break;
		case 'help':
			help.execute(args, processCommandCallback);
			break;
		default:
			$('body').append('<span class="unknown-command">waff: unknown command ' + command);
			processCommandCallback();
			break;
	}
}

function processCommandCallback() {
	$('body').append('<br />');
	printPrompt();
}
},{"./commands/cat.js":1,"./commands/dir.js":2,"./commands/emacs.js":3,"./commands/help.js":4,"./commands/whoami.js":5}],7:[function(require,module,exports){
var filesystem;

function getDir(dir, cb) {
	if(dir === '/') {
		return filesystem;
	}
	
	var currentContext = filesystem;
	var dirParts = dir.split('/');
	
	for(var dirPart in dirParts) {
		if(dirParts[dirPart] === "") {
			continue;
		}
		if(currentContext.content) {
			currentContext = currentContext.content[dirParts[dirPart]];
		}
		else {
			currentContext = currentContext[dirParts[dirPart]];
		}
	}
	cb(currentContext);
}

module.exports.getDirectory = function(directory, cb) {
	if(!filesystem) {
		$.get('/assets/data/files.json', function(data) {
			filesystem = data;
			
			getDir(directory, cb);
		})
	}
	
	getDir(directory, cb);
}
},{}],8:[function(require,module,exports){
var cwd = "/home/wuffy/"

module.exports.setCwd = function(newCwd) {
	cwd = newCwd;
}

module.exports.getCwd = function() {
	return cwd;
}
},{}]},{},[6]);
