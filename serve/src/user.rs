use std::{
    collections::HashMap,
    sync::atomic::{AtomicUsize, Ordering},
};

use rand::{distributions::Alphanumeric, thread_rng, Rng};
use rocket::{
    futures::future::ok,
    http::{Cookie, CookieJar, Status},
    request::{FromRequest, Outcome},
    response::status::NotFound,
    serde::{json::Json, Deserialize, Serialize},
    Request, State,
};

use crate::database::Database;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
#[serde(crate = "rocket::serde")]
#[sqlx(rename_all = "camelCase")]
pub struct User {
    id: i32,
    /// 昵称
    name: String,
    /// 头像
    avatar: Option<String>,
    /// 状态
    state: UserState,
    /// 帐号
    account: String,
    /// 密码
    password: String,
    /// 邮箱
    mail: Option<String>,
    /// 联系方式
    contact_ways: Option<sqlx::types::Json<HashMap<String, String>>>,
    /// 密保问题
    password_quastions: Option<sqlx::types::Json<HashMap<String, String>>>,
    /// 详细信息
    detail_information: Option<sqlx::types::Json<DetailInfo>>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct DetailInfo {
    /// 简介
    description: String,
    /// 地区
    zone: String,
    /// 生日
    birth_day: chrono::NaiveDate,
    /// 血型
    blood_type: BloodType,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum BloodType {
    A,
    B,
    AB,
    O,
    Other,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[serde(crate = "rocket::serde")]
#[repr(i32)]
pub enum UserState {
    Active = 0,
    Sleeping = 1,
    Busy = 2,
    Playing = 3,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
#[serde(crate = "rocket::serde")]
pub struct Regist {
    name: String,
    account: String,
    password: String,
}

/// 注册
#[post("/regist", format = "json", data = "<regist>")]
pub async fn regist(regist: Json<Regist>, pool: &State<Database>) -> Result<(), NotFound<String>> {
    if sqlx::query_as::<_, Regist>("select name,account,password from user where name = $1")
        .bind(&regist.name)
        .fetch_one(pool.db())
        .await
        .is_ok()
    {
        Err(NotFound(String::from("name repeat")))
    } else if sqlx::query_as::<_, Regist>(
        "select name,account,password from user where account = $1",
    )
    .bind(&regist.account)
    .fetch_one(pool.db())
    .await
    .is_ok()
    {
        Err(NotFound(String::from("account repeat")))
    } else {
        // println!("{:?}", regist);
        match sqlx::query(
            "insert into user (id,name,account,state,password) values (null, $1, $2, $3, $4)",
        )
        .bind(&regist.name)
        .bind(&regist.account)
        .bind(&UserState::Active)
        .bind(&regist.password)
        .execute(pool.db())
        .await
        {
            Ok(_) => Ok(()),
            Err(e) => {
                // eprintln!("{:?}", e);
                Err(NotFound(String::from("database has problem")))
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
#[serde(crate = "rocket::serde")]
pub struct Login {
    account: String,
    password: String,
}

pub struct LoginTime(pub(crate) AtomicUsize);

/// 登陆并发放令牌
// TODO: 添加对帐号是否已经登陆的检验
#[post("/login", format = "json", data = "<login>")]
pub async fn login(
    login: Json<Login>,
    pool: &State<Database>,
    jar: &CookieJar<'_>,
    time: &State<LoginTime>,
) -> Result<(), NotFound<String>> {
    match sqlx::query_as::<_, Login>(
        "select account,password from user where account = $1 and password = $2",
    )
    .bind(&login.account)
    .bind(&login.password)
    .fetch_one(pool.db())
    .await
    {
        Ok(_) => {
            // 删除重复帐号的 token
            sqlx::query("delete from tokens where account = $1")
                .bind(&login.account)
                .execute(pool.db())
                .await
                .is_err();

            jar.remove(Cookie::named("token"));

            let token_birth = || {
                thread_rng()
                    .sample_iter(&Alphanumeric)
                    .take(30)
                    .map(char::from)
                    .collect::<String>()
            };
            let mut token = token_birth();
            // 循环直到生成没有重复的token
            while sqlx::query_as::<_, TokenCheck>("select token from tokens where token = $1")
                .bind(&token)
                .fetch_all(pool.db())
                .await
                .is_err()
            {
                token = token_birth();
            }

            // 存储新token
            match sqlx::query("insert into tokens values (null, $1, $2)")
                .bind(&token)
                .bind(&login.account)
                .execute(pool.db())
                .await
            {
                Ok(_) => {
                    time.0.fetch_add(1, Ordering::Relaxed);
                    jar.add(Cookie::new("token", token));
                    Ok(())
                }
                Err(_e) => Err(NotFound(String::from(
                    "New token cannot be stored in database",
                ))),
            }
        }
        Err(_) => Err(NotFound(String::from("User is not exist!"))),
    }
}

#[derive(Debug, sqlx::FromRow)]
pub struct TokenCheck {
    token: String,
    account: String,
}

#[async_trait]
impl<'r> FromRequest<'r> for TokenCheck {
    type Error = sqlx::Error;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        match request.guard::<&State<Database>>().await {
            Outcome::Success(pool) => match request.cookies().get("token") {
                Some(t) => {
                    let recive = t.value().to_string();
                    eprintln!("{:?}", &recive);

                    if let Ok(token_check) = sqlx::query_as::<_, TokenCheck>(&format!(
                        "select token, account from tokens where token = {:?}",
                        &recive
                    ))
                    .fetch_one(pool.db())
                    .await
                    {
                        Outcome::Success(token_check)
                    } else {
                        // 数据库中未保存有对应的 token
                        Outcome::Failure((Status::NotFound, sqlx::Error::RowNotFound))
                    }
                }
                // 未接受到有对应值的 cookie
                None => Outcome::Failure((Status::NotFound, sqlx::Error::WorkerCrashed)),
            },
            // 数据库连接失败
            Outcome::Failure((s, _)) => Outcome::Failure((s, sqlx::Error::PoolClosed)),
            Outcome::Forward(_) => Outcome::Forward(()),
        }
    }
}

/// 注销
#[get("/logout")]
pub async fn logout(
    token: TokenCheck,
    pool: &State<Database>,
    jar: &CookieJar<'_>,
) -> Result<(), NotFound<String>> {
    jar.remove(Cookie::named("token"));
    match sqlx::query("delet from tokens where token = $1")
        .bind(token.token)
        .execute(pool.db())
        .await
    {
        Ok(_) => Ok(()),
        Err(_) => Err(NotFound(String::from("Didn't found token in database."))),
    }
}

/// 删号
#[delete("/delet", format = "json", data = "<account>")]
pub async fn delete(
    account: String,
    pool: &State<Database>,
    token: TokenCheck,
    jar: &CookieJar<'_>,
) -> Result<(), NotFound<String>> {
    if let Ok(_) = sqlx::query("delet from user where account = $1 ")
        .bind(account)
        .execute(pool.db())
        .await
    {
        if let Err(_) = sqlx::query("delet from tokens token = $1")
            .bind(&token.token)
            .execute(pool.db())
            .await
        {
            Err(NotFound(String::from("Token is not in database.")))
        } else {
            jar.remove(Cookie::named("token"));
            Ok(())
        }
    } else {
        Err(NotFound(String::from("User is not exist!")))
    }
}

/// 获取帐号信息
#[get("/information")]
pub async fn user_info(
    token_check: TokenCheck,
    pool: &State<Database>,
) -> Result<Json<User>, NotFound<String>> {
    if let Ok(mut user) = sqlx::query_as::<_, User>("select * from user where account = $1")
        .bind(token_check.account)
        .fetch_one(pool.db())
        .await
    {
        user.password = String::new();
        Ok(Json(user))
    } else {
        Err(NotFound(String::from("Not found your information!")))
    }
}

/// 确认用户操作：检验 token 和 密码
#[post("/confirm", data = "<password>")]
pub async fn confirm(
    password: String,
    token_check: TokenCheck,
    pool: &State<Database>,
) -> Result<(), NotFound<String>> {
    if let Ok(user) = sqlx::query_as::<_, Login>(
        "select account,password from user where account = $1 and password = $2",
    )
    .bind(&token_check.account)
    .bind(&password)
    .fetch_one(pool.db())
    .await
    {
        Ok(())
    } else {
        Err(NotFound(String::from("User is not found!")))
    }
}

/// 确认用户是否已经登陆
#[get("/login/check")]
pub fn login_confirm(_token_check: TokenCheck) -> Result<(), NotFound<String>> {
    Ok(())
}
