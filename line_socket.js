// A subclass of Socket which reads data by line

var net  = require('net');
var util = require('util');

function Socket(options) {
    if (!(this instanceof Socket)) return new Socket(options);
    net.Socket.call(this, options);
    this.current_data = [];
    this.on('data', this.process_data);
    this.on('end', this.process_end);
}

util.inherits(Socket, net.Socket);

exports.Socket = Socket;

var separator = '\n'.charCodeAt(0);
Socket.prototype.process_data = function (data) {
    var current_data = this.current_data;
    var results;
    var l = data.length;
    var start = 0;
    for(var i = 0; i < l;) {
        if(data[i++] === separator) {
            if(current_data.length) {
                var this_line = current_data.join('') + data.slice(start, i);
                current_data = this.current_data = [];
            }
            else {
                var this_line = data.slice(start, i).toString();
            }
            start = i;
            this.emit('line', this_line);
        }
    }
    if(start != l) {
        current_data[current_data.length] = data;
    }
};

Socket.prototype.process_end = function () {
    if (this.current_data.length)
        this.emit('line', this.current_data.join(''))
    this.current_data = [];
};
