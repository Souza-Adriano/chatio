import { Socket, Server} from 'socket.io';

abstract class AbstractSocket {
    protected socket: Socket;
    protected server: Server;

    constructor(socket: Socket, server: Server) {
        this.socket = socket;
        this.server = server;
    }
}

export default AbstractSocket;