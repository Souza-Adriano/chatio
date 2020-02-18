import Database from '../config/database';
import Knex from 'knex';
import { v4 as uuid } from 'uuid';
import Validator from '../lib/Validator';

abstract class AbstractModel {
    protected database: Knex = Database;
    protected genID: () => string = uuid;
    protected validator: Validator;
    constructor() {
        this.validator = new Validator();
    }
}

export default AbstractModel;