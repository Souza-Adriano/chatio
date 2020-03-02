import Authentication from '../middlewares/Authentication';
import bodyParser from 'body-parser';
import cors from 'cors';

export default [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cors(),
    Authentication,
];