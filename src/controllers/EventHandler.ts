import { EventEmitter } from 'events';
import Collection from '../lib/Collection';

export interface Command {
    command: string;
    data: any;
}

export class Commander {
    private events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
    }

    public command(command: string, ...args: any): void {
        this.events.emit(command, args);
    }

    public executer(command: string, callback: (...args: any) => void): void {
        console.log(command);
        this.events.on(command, callback);
    }

}

class EventHandler {
    private static handlers: Collection<Commander> = new Collection<Commander>('event-handlers');

    constructor() {}

    public static register(socket: string): void {
        this.handlers.store(socket, new Commander());
    }

    public static delete(socket: string): void {
        this.handlers.remove(socket);
    }

    public static commander(socket: string): Commander {
        return this.handlers.collect(socket);
    }

    public static info() {
        return this.handlers.info;
    }

    public static has(socket: string): boolean {
        return this.handlers.has(socket);
    }

    public static size(): number {
        return this.handlers.length();
    }

    public static key(socket: string) {
        return this.handlers.keyInfo(socket);
    }

    public static listHandlers(): string[] {
        return this.handlers.listKeys();
    }
}

export default EventHandler;