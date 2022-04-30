import styles from './Login.module.css';
import logo from '../logo.svg';
import { createSignal, For, Show } from 'solid-js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios'
import Warnning from './Warnning';
import InputGroup from './InputGroup';

type States = "Login" | "Regist"

export const [loginProps, setLoginProps] = createSignal({ account: "", password: "" });
export const [name, setName] = createSignal("");
export const [state, setState] = createSignal("Login" as States);

export default function Login() {
    const postLogin = () => {
        axios.post('/user/login', loginProps())
            .then((_r) => setWarning("false"))
            .catch((err) => setWarning(err))
    }

    const postRegist = () => {
        let regist = { ...loginProps(), name: name() };
        axios.post('/user/regist', regist)
            .then((_r) => setWarning("false"))
            .catch((err) => setWarning(err))
    }

    const [warnning, setWarning] = createSignal("false");

    return (
        <div class={styles.Login}>
            <img src={logo} class={styles.logo} alt="logo" />
            <Show when={warnning() != "false"}>
                <Warnning warnningList={[warnning()]} />
            </Show>
            <InputGroup />
            <div class={styles.ButtonGroup}>
                {
                    state() == "Login"
                        ? <button class={styles.loginButton} type="submit" onClick={postLogin}>Login</button>
                        : <button class={styles.UntouchButton} type="submit" onClick={() => { setState("Login"); setWarning("false"); }}>to Login</button>
                }
                {
                    state() == "Regist"
                        ? <button class={styles.loginButton} type="submit" onClick={postRegist}>Register</button>
                        : <button class={styles.UntouchButton} type="submit" onClick={() => { setState("Regist"); setWarning("false"); }}>to Regist</button>
                }
            </div>
        </div>
    );
}
