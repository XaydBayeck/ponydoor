import { Component, createResource, createSignal, lazy, Match, Show, Switch } from 'solid-js';

import styles from './App.module.css';
import { Navigate, Outlet, Route, Routes } from 'solid-app-router';
import axios from 'axios';

const Login = lazy(() => import('./login/Login'));

type MainPage = "loginOrRegist" | "userHome" | "statictisc";

const App: Component = () => {
  const checkLogin = () => {
    return axios.get('/user/login/check')
      .then((_response) => {
        setMainState("userHome");
        console.log("Is success."); // 测试用
        return "userHome" as MainPage;
      })
      .catch((_error) => {
        setMainState("loginOrRegist");
        console.log("Is error."); // 测试用
        console.log(mainState());
        return "loginOrRegist" as MainPage;
      })
  }

  const [mainState, setMainState] = createSignal("loginOrRegist" as MainPage);
  const [loginChecker] = createResource(mainState, checkLogin);
  return (
    <div class={styles.App}>
      {/* <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header> */}
      <Show when={!loginChecker.loading} fallback={<div>loading...</div>}>
        <div class={styles.Navbar}>
          <button onClick={() => setMainState("userHome")} >User Home</button>
          <button onClick={() => setMainState("statictisc")} >Statictisc Data</button>
        </div>
        <Switch fallback={<div>404 Not Found</div>}>
          <Match when={mainState() == "loginOrRegist"}>
            <Login />
          </Match>
          <Match when={mainState() == "userHome"}>
            <div>User home page</div>
          </Match>
          <Match when={mainState() == "statictisc"}>
            <div>User statictisc page</div>
          </Match>
        </Switch>
      </Show>
    </div >
  );
};

export default App;
