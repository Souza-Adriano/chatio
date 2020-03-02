import express from 'express';
import { Application } from 'express';
import { createServer, Server } from 'http';
import * as IO from 'socket.io';
import Env from './env';
import { SocketAuthentication } from '../middlewares/Authentication';
import LogHandler from '../controllers/LogHandler';
import Rooms from '../controllers/Rooms';
import EventHandler from '../controllers/EventHandler';

class App {
    public app: Application;
    private ENV = Env.get('APP');
    private port: number;
    private Http: Server;
    private SocketServer: IO.Server;
    private rooms: Rooms = Rooms.getInstance();

    constructor(init: { middlewares: any; routes: any; sockets: {user: any[], customer: any[]}}) {
        this.app = express();
        this.port = this.ENV.PORT;
        this.Http = createServer(this.app);
        this.SocketServer = IO.default(this.Http);
        this.sockets(init.sockets);
        this.middlewares(init.middlewares);
        this.routes(init.routes);
        LogHandler.logger();
    }

    private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
        middleWares.forEach((middleWare) => this.app.use(middleWare));
    }

    private routes(routes: { forEach: (arg0: (routes: any) => void) => void; }) {
        routes.forEach((route) => this.app.use('/', route.router));
    }

    private sockets(sockets: {user: any[], customer: any[]}): void {
        this.SocketServer.on('connection', async (socket) => {
            try {
                const data = await SocketAuthentication(socket.handshake, socket.id);
                socket.join(data.email);

                EventHandler.register(socket.id);

                data.type === 'user'
                    ? this.rooms.room(data.email, data.socket)
                    : this.rooms.queue(data.email, data.socket);

                data.type === 'user'
                    ? sockets.user.forEach((SocketEvent) => new SocketEvent(socket, this.SocketServer, data))
                    : sockets.customer.forEach((SocketEvent) => new SocketEvent(socket, this.SocketServer, data));

            } catch (error) {
                LogHandler.fail(`socket error: ${error.message}`);
                if (EventHandler.has(socket.id) === true) { EventHandler.delete(socket.id); }
                socket.error(error.message);
                socket.disconnect(true);
            }
        });
    }

    public start() {
        this.Http.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

export default App;