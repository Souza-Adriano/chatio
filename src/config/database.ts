import ENV from './env';
import Knex, { Config } from 'knex';

interface DatabaseConfig {
    client: string;
    db: string;
    user: string;
    password: string;
    pool: {
        min: number;
        max: number;
    };
    migrations: string;
}

const DBCONFIG = (ENV: any): Config => {
    const config: DatabaseConfig = {
        client: ENV.CLIENT,
        db: ENV.DB,
        user: ENV.USER,
        password: ENV.PASSWORD,
        pool: {
            min: ENV.MINPOOL,
            max: ENV.MAXPOOL,
        },
        migrations: ENV.MIGRATIONS,
    };

    return {
        client: config.client,
        connection: {
            database: config.db,
            user:     config.user,
            password: config.password,
        },
        pool: {
            min: config.pool.min,
            max: config.pool.max,
        },
        migrations: {
            tableName: config.migrations,
        },
    };
};

const Database: Knex = Knex(DBCONFIG(ENV.get('DATABASE')));

export default Database;