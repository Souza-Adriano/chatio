import { config } from 'dotenv';

interface EnvProp {
    key: string;
    index: number;
}

interface Namespace extends Object {
    namespace: string;
}

class ENV {
    [x: string]: any;
    private static instance: ENV;
    private env: object;
    private values: any[]
    private namespaces: Namespace[];

    constructor() {
        config();
        this.env = process.env;
        this.values = Object.values(this.env);
        this.namespaces = this.getNamespaces()
            .map((namespace: string) => ({ namespace, ...this.getProps(`${namespace}_`) }));
    }

    private parseProp(value: string): string | number {
        return isNaN(Number(value)) ? value : Number(value);
    }

    private getNamespaces(): string[] {
        return Object.keys(this.env)
            .reduce((list: string[], key: string) => {
                const namespace: string = key.split('_')[0];
                if (list.includes(namespace) !== true) { list.push(namespace); }

                return list;
            }, []);
    }

    private reduceToProps = (prefix: string, values: string[]) => (obj: object, item: EnvProp) => {

        Object.defineProperty(
            obj,
            item.key.replace(prefix, ''),
            { value: this.parseProp(values[item.index]), enumerable: true, writable: false });
        return obj;
    }

    public getProps(prefix: string): any {
        const Props: object = Object.keys(this.env)
            .map((key: string, index: number) => ({ key, index }))
            .filter((item: EnvProp) => item.key.includes(prefix))
            .reduce(this.reduceToProps(prefix, this.values), {});

        return Object.freeze(Props);
    }

    public static getInstance(): ENV {
        if (!ENV.instance) {
            ENV.instance = new ENV();
        }
        return ENV.instance;
    }

    public get(namespace: string): any {
       try {
            const nspace = this.namespaces.find((item) => item.namespace === namespace);
            if (nspace === undefined) { throw new Error('namespace not exists on your .env file') }
            return nspace;
       } catch (error) {
           throw error;
       }
    }
}

export default ENV.getInstance();