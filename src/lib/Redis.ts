import redis from 'ioredis';
import env from '../config/env';
const ENV = env.get('REDIS');

class Redis {
    public static connection = new redis(ENV.PORT, ENV.HOST, { connectionName: 'chatio-server' });
}

export default Redis;