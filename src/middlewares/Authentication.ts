import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../controllers/ErrorHandler';
import Session, { UserSession } from '../controllers/Session';
import { unauthenticate } from '../routes/routes.config.json';
import Validator from '../lib/Validator';
import LogHandler from '../controllers/LogHandler';
interface AuthHeader {
    token: string;
    prefix: string;
}

declare global {
    namespace Express {
        interface Request {
            session: UserSession;
        }
    }
}

const getAuthorizationHeader = (header: string | undefined): AuthHeader => {
    if (!header) {
        throw new ResponseError('authorization header not found', 401, new Error('authorization header not found'));
    }

    const data = header.split(' ');

    if (data.length !== 2) {
        throw new ResponseError('invalid authorization header', 401, new Error('invalid authorization header'));
    }

    return { prefix: data[0], token: data[1] };
};

const isValidToken = async (token: string): Promise<UserSession> => {
    try {
        const session: Session = new Session();
        const data: UserSession = await session.get(token);
        return data;
    } catch (error) {
        throw new ResponseError(error.message, 401, new Error(error.message));
    }
};

const isValidPrefix = (prefix: string): void => {
    if (prefix !== 'Bearer') {
        throw new ResponseError('invalid authorization header', 401, new Error('invalid authorization header'));
    }
};

const autenticateRoutes = (route: string): boolean => {
    return !unauthenticate.includes(route);
};

const Authentication = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
        if (autenticateRoutes(request.path) === false) { return next(); }
        const authorization: AuthHeader = getAuthorizationHeader(request.header('authorization'));

        isValidPrefix(authorization.prefix);
        const session: UserSession = await isValidToken(authorization.token);

        request.session = session;

        next();
    } catch (error) {
        if (error.status) {
            response.sendStatus(error.status);
        } else {
            response.sendStatus(500).send('Internal server error');
        }
    }

};

interface SocketSession {
    socket: string;
    type: string;
}

export interface SocketUser extends SocketSession, UserSession {}

export interface SocketCustomer extends SocketSession {
    id: string;
    name: string;
    email: string;
    info: any;
}

const validateQuery = (query: any) => {
    try {
        const validator = new Validator();
        validator.isEmail(query.email, 'is not a valid email');
        validator.onLength(query.name, { min: 3, max: 100 }, 'name');
    } catch (error) {
        if (error.message) {
            throw new RangeError(error.message);
        } else {
            throw new Error('Unregistred error');
        }
    }
};

const getSocketQuery = (query: any, id: string): SocketCustomer => {
    if (!query) { throw new Error('query not found.'); }
    validateQuery(query);
    LogHandler.success(`customer ${query.email} connected`);
    return { type: 'customer', socket: id, ...query };
};

export const SocketAuthentication = async (socket: any, id: string): Promise<SocketUser | SocketCustomer>  => {
    try {
        if (!socket.query.authorization) {
            return getSocketQuery(socket.query, id);
        }

        const authorization: AuthHeader = getAuthorizationHeader(socket.query.authorization);
        isValidPrefix(authorization.prefix);

        const user: UserSession = await isValidToken(authorization.token);
        const session: SocketUser = {
            type: 'user',
            socket: id,
            ...user,
        };
        LogHandler.success(`user: ${session.email} connected`);
        return session;

    } catch (error) {
        throw error;
    }
};

export default Authentication;