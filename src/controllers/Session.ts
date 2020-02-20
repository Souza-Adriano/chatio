import Redis from '../lib/Redis';
import moment from 'moment';
import Random from '../lib/Random';
import Enigma from '../lib/Enigma';

interface User {
    id: string;
    email: string;
    name: string;
    nickname: string;
    avatar: string;
}

export interface UserSession {
    id: string;
    email: string;
    name: string;
    nickname: string;
    avatar: string;
    iat: number;
    exp: number;
}

interface DataSession extends UserSession {
    token: string;
}

interface Token {
    key: string;
    token: string;
}

interface TokenValidation {
    key: string;
    exp: number;
    token: string;
    user: DataSession;
}

class Session {
    private redis = Redis.connection;
    private key: (id: string) => string = (id: string): string => `@SESSION:${id}`;
    private enigma: Enigma = new Enigma(6);
    private random: Random = new Random();

    constructor() {}

    private create(user: User): UserSession {
        const iat = new Date(moment.utc().format()).getUTCMilliseconds();
        const exp = (60 * 120) + iat;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar,
            iat,
            exp,
        };
    }

    private async token(): Promise<Token> {
        const token: string = this.random.string(20, {characters: true, specials: true, numbers: true});
        const key: string = await this.enigma.encrypt(token);

        return { key, token };
    }

    private async extend(session: UserSession, key: string): Promise<void> {
        const now: number = new Date(moment.utc().format()).getUTCMilliseconds();
        session.exp = (60 * 120) + now;
        await this.redis.set(key, JSON.stringify(session), 'ex', session.exp);
    }

    private async validate(data: TokenValidation): Promise<UserSession> {
        await this.enigma.validate(data.key, data.token);
        const Now: number = new Date(moment.utc().format()).getUTCMilliseconds();

        if (data.exp < Now) { throw new Error('expired token'); }

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            nickname: data.user.nickname,
            avatar: data.user.avatar,
            iat: data.user.iat,
            exp: data.user.exp,
        };
    }

    public async start(user: User): Promise<string> {
        const data: UserSession = this.create(user);
        const dataToken: Token = await this.token();
        const key: string = this.key(dataToken.key);

        const session: DataSession = { ...data, token: dataToken.token };
        await this.redis.set(key, JSON.stringify(session), 'ex', session.exp);

        return dataToken.key;
    }

    public async get(key: string): Promise<UserSession> {
        try {
            const dataString = await this.redis.get(this.key(key));
            if (!dataString) { throw new Error('session not found'); }
            const data: DataSession  = JSON.parse(dataString);

            const session: UserSession = await this.validate({exp: data.exp, key, token: data.token, user: data});
            await this.extend(session, this.key(key));

            return session;
        } catch (error) {
            throw error;
        }
    }
}

export default Session;