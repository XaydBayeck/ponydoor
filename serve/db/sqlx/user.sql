create table if not exists user (
    id integer primary key not null,
    name text not null,
    avatar text,
    account text not null,
    state text not null,
    password text not null,
    mail text,
    contactWays text,
    passwordQuastions text,
    detailInformation text
);
