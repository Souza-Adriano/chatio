import AbstractSocket from './AbstractSocket';
import { Socket, Server} from 'socket.io';
import { SocketUser } from '../middlewares/Authentication';
import Rooms from '../controllers/Rooms';
import EventHandler, { Commander, Command } from '../controllers/EventHandler';

class User extends AbstractSocket<SocketUser> {
    private rooms: Rooms = Rooms.getInstance();
    private handler: Commander;

    constructor(socket: Socket, server: Server, session: SocketUser) {
        super(socket, server, session);
        this.handler = EventHandler.commander(this.socket.id);
        this.commands();
        this.commander();
        this.notify();
    }

    private commander(): void {
        this.socket.on(this.session.email, async (command: Command) => {
            this.handler.command(command.command, command.data);
        });
    }

    private commands(): void {
        this.handler.executer('get:attendence', () => {
            this.rooms.pushCustomerToRoom(this.session.email);
        });

        this.handler.executer('send', (msg) => {
            const data = this.rooms.message(this.session.email);
            this.socket.to(data.to).emit('message', {
                from: data.from,
                iat: new Date().toDateString(),
                message: msg[0],
            });
        });
    }

    private emitNotify(event: { notification: string, data: any }): void {
        this.server.to(this.session.email).emit(event.notification, event.data);
    }

    private notify(): void {
        this.socket.join('notify:user');

        this.rooms.notify.queueLength((length: number) => {
            this.emitNotify({notification: 'queue:change', data: length});
        });

        this.rooms.notify.queue((email: string) => {
            this.emitNotify({notification: 'queue:enter', data: email})
        });

        this.rooms.notify.room((email: string) => {
            this.emitNotify({notification: 'room:enter', data: email})
        });
    }
}

export default User;