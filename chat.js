const server = require('./bin/www')

const io = require("socket.io")(server, {
    serveClient: false,
});

console.log("io on");

io.on("connection", socket => {


    console.log(socket.id);

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
       

    });

});
