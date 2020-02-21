import AbstractSocket, { CommonSession } from './AbstractSocket';
import { Socket, Server} from 'socket.io';

class Room extends AbstractSocket<CommonSession> {
    constructor(socket: Socket, server: Server, session: CommonSession) {
        super(socket, server, session);
    }
}