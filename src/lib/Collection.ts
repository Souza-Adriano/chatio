import moment from 'moment';

interface CollectionStorage<T> {
    collect(key: string): T;
    store(key: string, value: T): void;
    has(key: string): boolean;
    update(key: string, value: T): void;
    length(): number;
    remove(key: string): void;
}

interface CollectionRegister {
    name: string;
    removed: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface RegistrKey {
    createdAt: Date;
    updatedAt: Date;
}

class Collection<T> implements CollectionStorage<T> {
    private keys: string[];
    private values: T[];
    private RegisterKeys: RegistrKey[];
    private register: CollectionRegister;

    constructor(name: string) {
        this.keys = [];
        this.values = [];
        this.RegisterKeys = [];
        this.register = {
            name,
            createdAt: new Date(moment.utc().format()),
            updatedAt: new Date(moment.utc().format()),
            removed: [],
        };
    }

    private getIndex(key: string): number {
        return this.keys.indexOf(key);
    }

    private getValue(key: string): T {
        return this.values[this.getIndex(key)];
    }

    private delete(index: number): void {
        this.keys.splice(index, 1);
        this.values.splice(index, 1);
        this.RegisterKeys.splice(index, 1);
    }

    private updateRegisterKey(index: number) {
        const current = this.RegisterKeys[index];
        this.RegisterKeys[index] = {
            createdAt: current.createdAt,
            updatedAt: new Date(moment.utc().format()),
        };
    }

    public get name(): string {
        return this.register.name;
    }

    public get info(): CollectionRegister {
        return this.register;
    }

    public collect(key: string): T {
        if (this.has(key) !== true) { throw new Error('Key not exists on this collection to get register'); }
        return this.getValue(key);
    }

    public store(key: string, value: any): void {
        if (this.has(key) === true) { throw new Error('Key alredy exists on this collection, in this case is allowed update.'); }

        this.keys.push(key);
        this.values.push(value);
        this.RegisterKeys.push({
            createdAt: new Date(moment.utc().format()),
            updatedAt: new Date(moment.utc().format()),
        });
    }

    public keyInfo(key: string): RegistrKey {
        if (this.has(key) !== true) { throw new Error('Key not exists on this collection to get register'); }
        return this.RegisterKeys[this.getIndex(key)];
    }

    public listKeys(): string[] {
        return this.keys.map((item: string) => item);
    }

    public has(key: string): boolean {
        return this.keys.indexOf(key) !== -1;
    }

    public update(key: string, value: any): void {
        if (this.has(key) !== true) { throw new Error('Key not exists on this collection to be updated'); }
        const index = this.getIndex(key);
        this.values[index] = value;
        this.updateRegisterKey(index);
    }

    public length(): number {
        return this.keys.length;
    }

    public remove(key: string): void {
        if (this.has(key) !== true) { throw new Error('Key not exists on this collection to be removed'); }
        const keyIndex: number = this.getIndex(key);
        this.delete(keyIndex);
    }
}

export default Collection;