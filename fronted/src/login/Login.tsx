import styles from './Login.module.css';
import logo from '../logo.svg';
import { createSignal, For, Show } from 'solid-js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios'
import Warnning from './Warnning';
import InputGroup from './InputGroup';
import { setMainState } from '../App';

type States = "Login" | "Regist"

let avatar_url = "https://openclipart.org/image/800px/324734"
export const [user, setUser] = createSignal({ id: 1, name: "Test User", avatar: avatar_url, state: "Active", account: "theaccountoftestuser" } as User)
export const [loginProps, setLoginProps] = createSignal({ account: "", password: "" });
export const [name, setName] = createSignal("");
export const [state, setState] = createSignal("Login" as States);

export interface User {
    id: number,
    name: string,
    avatar: string,
    state: string,
    account: string,
    mail: string | null,
    contactWays: Map<string, string> | null,
    passwordQuastions: Map<string, string> | null,
    detailInformation: {
        description: string,
        zone: string,
        birthday: string,
        bloodtype: string
    } | null
}

export default function Login() {
    const postLogin = () => {
        axios.post<User>('/user/login', loginProps())
            .then((r) => {
                setWarning("false");
                setUser(r.data);
                setMainState("userHome")
            })
            .catch((err: string) => setWarning(err))
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
                <Warnning warnningList={[warnning(), "test segments"]} />
            </Show>
            <InputGroup />
            <div class={styles.ButtonGroup}>
                {
                    state() == "Login"
                        ? <button class={styles.loginButton} type="submit" onClick={postLogin}>Login</button>
                        : <button class={styles.UntouchButton} type="submit" onClick={() => { setState("Login"); setWarning("false"); }}>Login</button>
                }
                {
                    state() == "Regist"
                        ? <button class={styles.loginButton} type="submit" onClick={postRegist}>Regist</button>
                        : <button class={styles.UntouchButton} type="submit" onClick={() => { setState("Regist"); setWarning("false"); }}>Regist</button>
                }
            </div>
        </div>
    );
}
