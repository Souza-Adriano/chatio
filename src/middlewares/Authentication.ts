import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../controllers/ErrorHandler';
import Session, { UserSession } from '../controllers/Session';
import { unauthenticate } from '../routes/routes.config.json';

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
        const session: UserSession = await isValidToken(authorization.prefix);

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

export default Authentication;