import { compare, genSalt, hash } from 'bcrypt';

class Enigma {
    private salt: number;

    constructor(salt: number = 10) {
        this.salt = salt;
    }

    public async encrypt(data: string): Promise<string> {
        return await hash(data, await genSalt(this.salt));
    }

    public async validate(data: string, hash: string): Promise<boolean> {
        return await compare(data, hash);
    }
}

export default Enigma;