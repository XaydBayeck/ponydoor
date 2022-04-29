create table if not exists tokens (
    id integer primary key not null,
    token text not null,
    account text not null
);
