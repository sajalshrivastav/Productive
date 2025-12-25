import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Adjust as needed

class SocketService {
    socket = null;

    connect(userId) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
            this.socket.emit('join', userId);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();
