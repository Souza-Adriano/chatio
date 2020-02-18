import { EventEmitter } from 'events';
import { Printer } from '../lib/Paint';

class LogHandler {
    private static events: EventEmitter = new EventEmitter();
    private static printer = Printer;

    public static fail(msg: string): void {
        this.events.emit('fail', msg);
    }

    public static success(msg: string): void {
        this.events.emit('success', msg);
    }

    public static warning(msg: string): void {
        this.events.emit('warning', msg);
    }

    public static info(msg: string): void {
        this.events.emit('info', msg);
    }

    public static message(msg: string): void {
        this.events.emit('message', msg);
    }

    public static logger(): void {
        this.events.on('fail', (msg: string) => this.printer.red(msg));
        this.events.on('success', (msg: string) => this.printer.green(msg));
        this.events.on('warning', (msg: string) => this.printer.yellow(msg));
        this.events.on('info', (msg: string) => this.printer.blue(msg));
        this.events.on('message', (msg: string) => console.log(msg));
    }
}

export default LogHandler;