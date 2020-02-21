import { Socket, Server} from 'socket.io';

export interface CommonSession {
    id: string;
    name: string;
    email: string;
}

interface ServerMessage {
    name: string;
    email: string;
    content: string;
}

interface PrivateServerMessage extends ServerMessage {
    to: string[];
}

interface Notification {
    to?: string;
    status: string;
    data?: any;
}

abstract class AbstractSocket<SESSION> {
    protected socket: Socket;
    protected server: Server;
    protected session: SESSION;

    constructor(socket: Socket, server: Server, session: SESSION) {
        this.socket = socket;
        this.server = server;
        this.session = session;
    }

    protected global(message: ServerMessage): void {
        this.server.emit('global', message);
    }

    protected notification(notification: Notification): void {
        if (notification.to) {
            if (notification.data) {
                this.server.to(notification.to).emit(notification.status, notification.data);
            } else {
                this.server.to(notification.to).emit(notification.status);
            }
        } else {
            if (notification.data) {
                this.server.emit(notification.status, notification.data);
            } else {
                this.server.emit(notification.status);
            }
        }
    }

    protected direct(message: PrivateServerMessage): void {
        const content: ServerMessage = { name: message.name, email: message.email, content: message.content };
        message.to.forEach((user: string) => this.server.to(user).emit('direct', content));
    }

    protected disconnect(): void {
        this.socket.disconnect(true);
    }
}

export default AbstractSocket;