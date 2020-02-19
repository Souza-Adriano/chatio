import AbstractModel from './AbstractModel';
import Enigma from '../lib/Enigma';

interface UserAccount {
    id: string;
    name: string;
    nickname: string;
    email: string;
    avatar: string;
    password: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    nickname: string;
    avatar: string;
}

interface ExpectedBody {
    create: string[];
    authenticate: string[];
}

interface UserAuthenticate {
    email: string;
    password: string;
}

class Account extends AbstractModel {
    private body: ExpectedBody = {
        create: ['name', 'email', 'password', 'nickname', 'confirmPassword'],
        authenticate: ['email', 'password'],
    };
    private enigma: Enigma;

    constructor() {
        super();
        this.enigma = new Enigma();
    }

    private async validateCreation(body: any): Promise<UserAccount> {
        try {
            this.validator.isValidBody(body, this.body.create);
            this.validator.isEmail(body.email, `${body.email} is not a valid email.`);
            this.validator.isEqual(body.password, body.confirmPassword, 'password and confirm password not match');
            this.validator.onLength(body.password, {max: 50, min: 6}, 'password');
            this.validator.onLength(body.name, {min: 3, max: 50}, 'name');
            this.validator.onLength(body.name, {min: 3, max: 50}, 'nickname');

            const hash: string = await this.enigma.encrypt(body.password);

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

    private async validateAuthentication(body: any): Promise<UserAuthenticate> {
        this.validator.isValidBody(body, this.body.authenticate);
        this.validator.isEmail(body.email, `is not a valid email`);

        return body;
    }

    public async create(body: any): Promise<void> {
        try {
            const UserAccount: UserAccount = await this.validateCreation(body);
            await this.database('users')
                .insert(UserAccount);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async isAuthenticated(body: any): Promise<User> {
        const data: UserAuthenticate = await this.validateAuthentication(body);
        const user: UserAccount | undefined = await this.database<UserAccount>('users')
            .select('id', 'name', 'nickname', 'email', 'avatar', 'password')
            .where({ email: data.email })
            .first();

        if (!user) { throw new Error('invalid user/password'); }
        const isValid: boolean = await this.enigma.validate(data.password, user.password);
        if (isValid === false) { throw new Error('invalid user/password'); }

        return user;
    }
}

export default Account;