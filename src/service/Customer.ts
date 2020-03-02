import AbstractSocket from './AbstractSocket';
import { Socket, Server} from 'socket.io';
import { SocketCustomer } from '../middlewares/Authentication';
import Rooms from '../controllers/Rooms';
import EventHandler, { Commander, Command } from '../controllers/EventHandler';

class Customer extends AbstractSocket<SocketCustomer> {
    private rooms: Rooms = Rooms.getInstance();
    private handler: Commander;

    constructor(socket: Socket, server: Server, session: SocketCustomer) {
        super(socket, server, session);
        this.handler = EventHandler.commander(this.socket.id);
        this.commands();
        this.commander();
    }

    private commander(): void {
        this.socket.on(this.session.email, async (command: Command) => {
            this.handler.command(command.command, command.data);
        });
    }

    private commands(): void {
        this.handler.executer('send', (msg) => {
            const data = this.rooms.message(this.session.email);
            this.socket.to(data.to).emit('message', {
                from: data.from,
                iat: new Date().toDateString(),
                message: msg[0],
            });
        });
    }
}

export default Customer;