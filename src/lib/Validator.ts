class Validator {
    constructor() {}

    public isEmail(value: string, msg: string): void {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) === false) {
            throw new RangeError(msg);
        }
    }

    public isEqual <VALUE>(valueA: VALUE, valueB: VALUE, msg: string): void {
        if (valueA !== valueB) {
            throw new RangeError(msg);
        }
    }

    public isNotEqual <VALUE>(valueA: VALUE, valueB: VALUE, msg: string): void {
        if (valueA === valueB) {
            throw new RangeError(msg);
        }
    }

    public onLength(value: string | any[], length: { min: number, max: number }, propertie: string): void {
        if (!length.min || length.min === 0 ) { length.min = 1; }
        if (!length.max) { length.max = 255; }

        if (value.length > length.max) {
            throw new RangeError(`${propertie} max length is ${ length.max - 1 } and you inputed ${ value.length }`);
        }

        if (value.length < length.min) {
            throw new RangeError(`${propertie} min length is ${ length.min } and you inputed ${ value.length }`);
        }
    }

    public isValidBody(body: any, expect: string[]): void {
        const bodyProperties = Object.keys(body);

        const isExpected: string[] = expect.filter((item: string) => bodyProperties.indexOf(item) < 0 );
        const isNotExpected: string[] = bodyProperties.filter((item: string) => expect.indexOf(item) < 0 );

        if (isExpected.length > 0 || isNotExpected.length > 0) {
            throw new RangeError(`missing parameters: ${isExpected.join(', ')} \n unnecessary parameters: ${isNotExpected.join(', ')}`);
        }
    }
}

export default Validator;