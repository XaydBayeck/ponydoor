use std::sync::atomic::AtomicUsize;

use database::DbFairing;
use rocket::fs::{FileServer, NamedFile};
use user::LoginTime;

mod database;
mod statistics;
mod user;

use crate::user::{confirm, delete, login, login_confirm, logout, regist, user_info, update};

#[macro_use]
extern crate rocket;

#[get("/")]
async fn index() -> Option<NamedFile> {
    NamedFile::open("public/index.html").await.ok()
}

// #[get("/assets/<file..>")]
// fn assets(file: PathBuf) -> Redirect {
//     println!("{:?}", &file);
//     let url = format!(
//         "/public/assets/{}",
//         file.into_os_string().into_string().unwrap()
//     );
//     println!("{:?}", &url);
//     Redirect::to(url)
// }

#[launch]
fn rocket() -> rocket::Rocket<rocket::Build> {
    rocket::build()
        .attach(DbFairing::with_name("database"))
        .manage(LoginTime(AtomicUsize::new(0)))
        .mount("/", routes![index])
        .mount(
            "/user",
            routes![
                regist,
                login,
                logout,
                delete,
                confirm,
                user_info,
                login_confirm,
                update
            ],
        )
        .mount("/assets", FileServer::from("public/assets"))
}
