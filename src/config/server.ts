import express from 'express';
import { Application } from 'express';
import { createServer, Server } from 'http';
import * as IO from 'socket.io';
import Env from './env';

class App {
    public app: Application;
    private ENV = Env.get('APP');
    private port: number;
    private Http: Server;
    private SocketServer: IO.Server;

    constructor(init: { middlewares: any; routes: any; sockets: any[]}) {
        this.app = express();
        this.port = this.ENV.PORT;
        this.Http = createServer(this.app);
        this.SocketServer = IO.default(this.Http);
        this.sockets(init.sockets);
        this.middlewares(init.middlewares);
        this.routes(init.routes);
    }

    private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
        middleWares.forEach((middleWare) => this.app.use(middleWare));
    }

    private routes(routes: { forEach: (arg0: (routes: any) => void) => void; }) {
        routes.forEach((route) => this.app.use('/', route.router));
    }



    private sockets(socketEvents: any[]): void {
        this.SocketServer.on('connection', (socket) => {
            socketEvents.forEach((SocketEvent) => new SocketEvent(socket));
        });
    }

    public start() {
        this.Http.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

export default App;