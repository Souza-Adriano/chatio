import app from './config/server';
import middlewares from './config/middlewares';
import routes from './config/routes';
import sockets from './config/sockets';

const App = new app({
    middlewares,
    routes,
    sockets,
})

App.start();