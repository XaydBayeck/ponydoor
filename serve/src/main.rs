use database::DbFairing;
use rocket::fs::FileServer;

mod database;
mod user;
mod statistics;

#[macro_use]
extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .attach(DbFairing::with_name("database"))
        .mount("/", routes![index])
        .mount("/public", FileServer::from("public"))
}
