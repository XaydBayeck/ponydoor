import { Component, createResource, createSignal, lazy, Match, Show, Switch } from 'solid-js';

import styles from './App.module.css';
import axios from 'axios';
import UserHome from './userHome/UserHome';

const Login = lazy(() => import('./login/Login'));

type MainPage = "loginOrRegist" | "userHome" | "statistics";

export const [mainState, setMainState] = createSignal("loginOrRegist" as MainPage);
const App: Component = () => {
    const checkLogin = async () => {
        try {
            const _response = await axios.get('/user/login/check');
            setMainState("userHome");
            console.log("Is success."); // 测试用
            return "userHome" as MainPage;
        } catch (_error) {
            setMainState("loginOrRegist");
            console.log("Is error."); // 测试用
            console.log(mainState());
            return "loginOrRegist" as MainPage;
        }
    }

    const [loginChecker] = createResource(mainState, checkLogin);
    return (
        <div class={styles.App}>
            <Show when={!loginChecker.loading} fallback={<div>loading...</div>}>
                <div class={styles.Navbar}>
                    <button onClick={() => setMainState("userHome")} >User Home</button>
                    <button onClick={() => setMainState("statistics")} >Statictisc Data</button>
                </div>
                <div class={styles.MainBody}>
                    <Switch fallback={<div>404 Not Found</div>}>
                        <Match when={mainState() == "loginOrRegist"}>
                            <Login />
                        </Match>
                        <Match when={mainState() == "userHome"}>
                            <UserHome />
                        </Match>
                        <Match when={mainState() == "statistics"}>
                            <div>User statistics page</div>
                        </Match>
                    </Switch>
                </div>
            </Show>

        </div >
    );
};

export default App;
