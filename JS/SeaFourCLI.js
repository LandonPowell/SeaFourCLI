var blessed = require('blessed');
var socket  = require('socket.io-client')('https://seafour.club/');

/* Creates the 'screen' object. */
var screen = blessed.screen({
    smartCSR:   true,
    cursor:     {
        artificial: true,
        blink:      true,
        shape:      'underline'
    }
});

/* Sets your Term title to 'SeaFour'. */
screen.title = "SeaFour";

/* Holds the end-user's input. */
var inputBox = blessed.textarea({

    inputOnFocus:true,

    right:      1,
    bottom:     1,
    width:      '30%',
    height:     '20%',
    tags:       true,
    border:     { type: 'line' },
    style:      {
        fg:     'white',
        border: { fg: 'white' }
    }
});
inputBox.enableDrag();
screen.append(inputBox);

/* Holds other user's messages. */
var messages = blessed.box({
    top:        0,
    left:       0,
    width:      '69%',
    shrink:     true,
    scrollable: true,
    tags:       true
});
screen.append(messages);

screen.render();

/* - SOCKET LISTENERS - */

socket.on('userMessage', function(nick, post, id, flair) {
    var newMessage = blessed.box({
        content:    nick + " : " + post,
        right:      1,
        left:       1,
        shrink:     true,
        border:     { type: 'line' },
    });
    messages.append(newMessage);
    messages.scroll(20);
    screen.render();
});

socket.on('topic', function(topic) {
    if(topic.length > 14) inputBox.setLabel( topic.substr(0,14)+"…" );
    else inputBox.setLabel( topic );
});

/* - KEYPRESS LISTENERS - */

/* Listens for enters. */
inputBox.key('enter', function(ch, key) {
    inputMessage = this.getValue();

    if ( inputMessage[0] == "." ) { /* Commands start with a period. */
        var command = inputMessage.split(" ");

        switch(command[0]) {
            case ".login":
                socket.emit("login", command[1], command[2]);
                break;
            case ".nick":
                socket.emit("changeNick", inputMessage.substring(6));
                break;
            case ".roleChange":
                socket.emit("roleChange", command[1], command[2]);
                break;
            case ".kill":
                return process.exit(0);
                break;
            default:
                socket.emit(command[0].substr(1),
                            inputMessage.substring(command[0].length+1));
        }
    }
    else { /* Send any message that isn't a command. */
        socket.emit('userMessage', inputMessage);
    }

    this.clearValue();
});

/* This kills the Process. */
inputBox.key(['escape', 'C-c'], function(ch, key) {
    return process.exit(0);
});