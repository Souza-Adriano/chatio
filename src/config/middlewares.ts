
import bodyParser from 'body-parser';
import cors from 'cors';

export default [
    cors(),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
];