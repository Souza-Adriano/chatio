import { Router, Request, Response } from 'express';
import AccountModel from '../models/Account';
import Session from '../controllers/Session';

class Authenticate {
    public router = Router();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.post('/signin', this.validate);
    }

    public validate = async (request: Request, response: Response): Promise<void> => {
        try {
            const account: AccountModel = new AccountModel();
            const session: Session = new Session();

            const user = await account.isAuthenticated(request.body);
            const token = await session.start(user);

            response.json({token});
        } catch (error) {
        }
    }
}

export default Authenticate;