use database::DbFairing;
use rocket::fs::FileServer;

mod database;
mod statistics;
mod user;

use crate::user::{confirm, delete, login, logout, regist, user_info};

#[macro_use]
extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> rocket::Rocket<rocket::Build> {
    rocket::build()
        .attach(DbFairing::with_name("database"))
        .mount("/", routes![index])
        .mount(
            "/user",
            routes![regist, login, logout, delete, confirm, user_info],
        )
        .mount("/public", FileServer::from("public"))
}
