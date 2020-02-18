exports.up = function(knex, Promise) {
    return knex.schema.createTable("users", table => {
        table.uuid("id").primary();
        table.string('name').notNull();
        table.string('nickname').notNull();
        table.string('email').notNull();
        table.string('password').notNull();
        table.string('avatar', 1000).notNull();
        table.boolean('active').defaultTo(true);
        table.timestamps(true, true);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable("users");
};
