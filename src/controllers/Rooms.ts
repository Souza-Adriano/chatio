import LogHandler from './LogHandler';
import { EventEmitter } from 'events';

interface Room {
    user: string;
    socket: string;
    customer: string | null;
}

interface Message {
    from: string;
    to: string;
}

interface Notification {
    queue: (callback: (email: string) => void) => void;
    room: (callback: (email: string) => void) => void;
    queueLength: (callback: (length: number) => void) => void;
}

class Rooms {
    private static instance: Rooms;
    private rooms: Room[] = [];
    private customers: string[] = [];
    private eventNotify: EventEmitter = new EventEmitter();

    constructor() {}

    public static getInstance(): Rooms {
        if (!Rooms.instance) {
            Rooms.instance = new Rooms();
        }

        return Rooms.instance;
    }

    private customerIndex(email: string): number {
        return this.customers.findIndex((customer: string) => customer.includes(email));
    }

    private roomIndex(email: string): number {
        return this.rooms.findIndex((room: Room) => room.user === email);
    }

    public room(email: string, socket: string): void {
        const user = this.rooms.find((room: Room) => room.user === email);
        if (!user) {
            this.rooms.push({ user: email, customer: null, socket });
            this.eventNotify.emit('room', email);
        }
        LogHandler.warning(`room ${email} already created`);
        this.eventNotify.emit('room', email);
    }

    public pushCustomerToRoom(room: string): void {
        const userRoom = this.roomIndex(room);
        if (userRoom !== -1) {
            const customer: string | undefined = this.customers.shift();
            !customer
                ? LogHandler.warning('customers queue is empty')
                : this.rooms[userRoom].customer = customer;

            this.eventNotify.emit('queue:change', this.queueLength());
        } else {
            LogHandler.fail('room not found');
        }
    }

    public removeCustomerFromRoom(room: string): void {
        const userRoom = this.roomIndex(room);
        if (userRoom !== -1) {
            this.rooms[userRoom].customer = null;
        }
    }

    public queue(email: string, socket: string): void {
        const index = this.customerIndex(email);
        if (index !== -1) {
            LogHandler.warning(`customer ${email} already on queue, trhowing to end of queue`);
            this.customers.splice(index, 1);
        }

        this.customers.push(`${email}#${socket}`);
        this.eventNotify.emit('queue', email);
        this.eventNotify.emit('queue:change', this.queueLength());
    }

    public removeFromQueue(socket: string): void {
        const index: number = this.customers.findIndex((customer: string) => customer.includes(socket));
        if (index !== -1) {
            this.customers.splice(index, 1);
        }
    }

    public removeRoom(room: string) {
        const index = this.roomIndex(room);
        if ( index !== -1 ) { this.rooms.splice(index, 1); }
    }

    public message(email: string): Message {
        const data = this.rooms.find((room: Room) => {
            if (room.user.includes(email)) {
                return room;
            }

            if (room.customer !== null && room.customer.includes(email)) {
                return room;
            }
        });

        if (data) {
            if (data.customer === null) { throw new Error('Data is null on Room.message'); }
            const customersRoom = data.customer.split('#');
            return {
                from: data.user === email ? data.user : customersRoom[0],
                to: customersRoom[0] === email ? data.user : customersRoom[0],
            };
        } else {
            throw new RangeError(`room or customer ${email} not found on Room.message`);
        }
    }

    public queueLength(): number {
        return this.customers.length;
    }

    public notify: Notification = {
        queue: (callback: (email: string) => void): void => {
            this.eventNotify.on('queue', callback);
        },

        room: (callback: (email: string) => void): void => {
            this.eventNotify.on('room', callback);
        },

        queueLength: (callback: (length: number) => void) => {
            this.eventNotify.on('queue:change', callback);
        },
    };
}

export default Rooms;