import { Router, Request, Response } from 'express';
import AccountModel from '../models/Account';

class Account {
    public router = Router();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.post('/signup', this.create);
        this.router.post('/account', this.create);
        this.router.get('/account', this.list);
    }

    public create = async (request: Request, response: Response): Promise<void> => {
        try {

            const account = new AccountModel();
            await account.create(request.body);

            response.status(204).send();
        } catch (error) {
            response.status(500).send('internal server error');
        }
    }

    public async list(request: Request, response: Response): Promise<void> {
        try {
            response.sendStatus(200);
        } catch (error) {
            console.log(error);
            response.sendStatus(500);
        }
    }
}

export default Account;