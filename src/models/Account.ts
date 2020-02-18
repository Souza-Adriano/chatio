import AbstractModel from './AbstractModel';
import Enigma from '../lib/Enigma';

interface NewUserAccount {
    id: string;
    name: string;
    nickname: string;
    email: string;
    avatar: string;
    password: string;
}

interface ExpectedBody {
    create: string[];
}

class Account extends AbstractModel {
    private body: ExpectedBody = {
        create: ['name', 'email', 'password', 'nickname', 'confirmPassword'],
    };
    private enigma: Enigma;

    constructor() {
        super();
        this.enigma = new Enigma();
    }

    private async validateCreation(body: any): Promise<NewUserAccount> {
        try {
            this.validator.isValidBody(body, this.body.create);
            this.validator.isEmail(body.email, `${body.email} is not a valid email.`);
            this.validator.isEqual(body.password, body.confirmPassword, 'password and confirm passowrd not match');
            this.validator.onLength(body.passowrd, {max: 50, min: 6}, 'password');
            this.validator.onLength(body.name, {min: 3, max: 50}, 'name');
            this.validator.onLength(body.name, {min: 3, max: 50}, 'nickname');

            const hash: string = await this.enigma.encrypt(body.passowrd);

            return {
                id: this.genID(),
                name: body.name,
                nickname: body.nickname,
                email: body.email,
                password: hash,
                avatar: '/home/azuos/Apps/chatio/image/User.jpg',
            };
        } catch (error) {
            throw new Error(error);
        }

    }

    public async create(body: any): Promise<void> {
        try {
            const UserAccount: NewUserAccount = await this.validateCreation(body);
            await this.database('users')
                .insert(UserAccount);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default Account;