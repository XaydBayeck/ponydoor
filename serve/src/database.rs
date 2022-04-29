use std::marker::PhantomData;

use rocket::fairing::{self, Info, Kind};
use rocket::log::private::error;
use rocket::fairing::Fairing;
use rocket::{Build, Rocket};
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

pub struct Database(SqlitePool);

impl Database {
    pub async fn new(url: &str) -> Result<Self, sqlx::Error> {
        let pool = SqlitePoolOptions::new().connect(url).await?;
        Ok(Self(pool))
    }

    pub fn db(&self) -> &SqlitePool {
        &self.0
    }
}

pub struct DbFairing(Option<&'static str>, PhantomData<Database>);

impl DbFairing {
    pub fn new() -> Self {
        Self(None, std::marker::PhantomData)
    }

    pub fn with_name(name: &'static str) -> Self {
        Self(Some(name), std::marker::PhantomData)
    }
}

// #[]
// struct sqlx{url:String}

#[async_trait]
impl Fairing for DbFairing {
    fn info(&self) -> Info {
        Info {
            name: self.0.unwrap_or(std::any::type_name::<Self>()),
            kind: Kind::Ignite,
        }
    }

    async fn on_ignite(&self, rocket: Rocket<Build>) -> fairing::Result {
        // let config = rocket.figment().find_value("databases").unwrap();
        // let url = config.find("sqlx.url").unwrap();
        let url: String = rocket
            .figment()
            .extract_inner("databases.sqlx.url")
            .unwrap();

        match Database::new(&url).await {
            Ok(db) => Ok(rocket.manage(db)),
            Err(e) => {
                error!("failed to initialize database: {}", e);
                Err(rocket)
            }
        }
    }
}

