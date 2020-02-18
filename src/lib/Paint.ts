import { hex } from 'chalk';

export class Printer {
    private static hex: (color: string) => (msg: string) => string = hex;

    public static red(msg: string): void {
        console.log(this.hex('#ff5555')(msg));
    }

    public static blue(msg: string): void {
        console.log(this.hex('#8be9fd')(msg));
    }

    public static green(msg: string): void {
        console.log(this.hex('#50fa7b')(msg));
    }

    public static yellow(msg: string): void {
        console.log(this.hex('#f1fa8c')(msg));
    }

}

export class Painter {
    private static hex: (color: string) => (msg: string) => string = hex;

    public static red(msg: string): string {
        return this.hex('#ff5555')(msg);
    }

    public static blue(msg: string): string {
        return this.hex('#8be9fd')(msg);
    }

    public static green(msg: string): string {
        return this.hex('#50fa7b')(msg);
    }

    public static yellow(msg: string): string {
        return this.hex('#f1fa8c')(msg);
    }

}
