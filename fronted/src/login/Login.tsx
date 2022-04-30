import styles from './Login.module.css';
import logo from '../logo.svg';
import { createSignal } from 'solid-js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const [loginProps, setLoginProps] = createSignal({ account: "", password: "" });

export function Login() {
    return (
        <div class={styles.Login}>
            <img src={logo} class={styles.logo} alt="logo" />
            <Account />
            {/* 检验用: {loginProps().account} */}
            <Password />
            <button class={styles.loginButton} type="submit">Login</button>
        </div>
    );
}

function Account() {
    const changeAccount = (event: { currentTarget: HTMLInputElement }) =>
        setLoginProps((prev) => {
            return {
                account: event.currentTarget?.value,
                password: prev.password
            }
        });

    return (
        <div class={styles.Input}>
            <span class={styles.icon}>
                <i class="bi bi-person"></i>
            </span>
            <input type="text" name="account" id="account" onInput={changeAccount} />
        </div>
    );
}

function Password() {
    let [show, setShow] = createSignal(false);

    const changePassword = (event: { currentTarget: HTMLInputElement }) =>
        setLoginProps((prev) => {
            return {
                account: prev.account,
                password: event.currentTarget.value
            }
        });

    return (
        <div class={styles.Input}>
            <span class={styles.icon}>
                <i class="bi bi-shield"></i>
            </span>
            <input type={show() ? "text" : "password"} name="password" id="password" onInput={changePassword} />
            <button class={styles.PasswordShow} onClick={() => setShow((prev) => !prev)}>
                <i class={show() ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"} />
            </button>
        </div>
    );
}