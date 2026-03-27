const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join', (roomID) => {
        const clients = io.sockets.adapter.rooms.get(roomID);
        const numClients = clients ? clients.size : 0;

        if (numClients >= 4) { // 最大4人までに制限（Mesh型の負荷考慮）
            socket.emit('error-msg', 'ルームが満員です（最大4名）');
            return;
        }

        socket.join(roomID);
        socket.to(roomID).emit('user-joined', socket.id);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        io.emit('user-left', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server: ${PORT}`));
