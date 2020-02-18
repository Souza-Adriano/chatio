interface RandomStringOptions {
    numbers: boolean;
    characters: boolean;
    specials: boolean;
}

interface RandomOptions {
    characters?: string[];
    specials?: string[];
}

class Random {
    private characters: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z',
    ];

    private specials: string[] = [
        '!', '@', '#', '$',
        '%', '&', '*', '+',
        '-', ' ', '_', '?',
    ];

    constructor(options: RandomOptions = {}) {
        if (options.characters) { this.characters = options.characters; }
        if (options.specials) { this.specials = options.specials; }
    }

    private makeArray<X>(size: number, callback: () => any): X[] {
        const arr: X[] = [];

        for (let i = 0; i < size; i++) {
            arr.push(callback());
        }

        return arr;
    }

    private getTypes(options: RandomStringOptions): string[] {
        const types = [];

        if (options.characters === true) { types.push('character'); }
        if (options.numbers === true) { types.push('number'); }
        if (options.specials === true) { types.push('special'); }

        if (types.length === 0) { throw new Error('need 1 or more types to use;'); }
        return types;
    }

    private stringNumber(): string {
        return `${this.number(0, 9)}`;
    }

    public number(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public character(): string {
        const max: number = this.characters.length - 1;
        return this.characters[this.number(0, max)];
    }

    public special(): string {
        const max: number = this.specials.length - 1;
        return this.specials[this.number(0, max)];
    }

    public alphanumeric() {
        const type = this.number(0, 1);

        if (type === 0) { return this.character(); }
        if (type === 1) { return this.stringNumber(); }
    }

    // tslint:disable-next-line: max-line-length
    public string(size: number = 8, options: RandomStringOptions = {characters: true, numbers: true, specials: true}): string {
        const max: number = this.characters.length - 1;
        const randomString = this.makeArray <string> (size, () => {
            const types: string[] = this.getTypes(options);
            const type: number = this.number(0, types.length - 1);

            if (types[type] === 'character') {return this.character(); }
            if (types[type] === 'number') { return this.stringNumber(); }
            if (types[type] === 'special') { return this.special(); }

        });
        return randomString.join('');
    }
}

export default Random;