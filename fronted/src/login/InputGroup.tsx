import { createSignal, Show } from 'solid-js';
import { setLoginProps, setName, state } from './Login';
import styles from './Login.module.css';

export default function InputGroup() {
    const changeName = (event: { currentTarget: HTMLInputElement }) =>
        setName(event.currentTarget.value);

    const changeAccount = (event: { currentTarget: HTMLInputElement }) =>
        setLoginProps((prev) => {
            return {
                account: event.currentTarget?.value,
                password: prev.password
            }
        });

    let [show, setShow] = createSignal(false);

    const changePassword = (event: { currentTarget: HTMLInputElement }) =>
        setLoginProps((prev) => {
            return {
                account: prev.account,
                password: event.currentTarget.value
            }
        });

    return (
        <div class={styles.InputGroup}>
            <div class={styles.Keys}>
                <Show when={state() == "Regist"}>
                    <div class={styles.Key}>
                        <span class={styles.icon}>
                            <i class="bi bi-emoji-smile"></i>
                        </span>
                        <span>Name:</span>
                    </div>
                </Show>
                <div class={styles.Key}>
                    <span class={styles.icon}>
                        <i class="bi bi-person"></i>
                    </span>
                    <span>Account:</span>
                </div>
                <div class={styles.Key}>
                    <span class={styles.icon}>
                        <i class="bi bi-shield"></i>
                    </span>
                    <span>Password:</span>
                </div>
            </div>
            <div class={styles.Inputs}>
                <Show when={state() == "Regist"}>
                    <div class={styles.Input}>
                        <input type="text" name="name" id="name" onInput={changeName} />
                    </div>
                </Show>
                <div class={styles.Input}>
                    <input type="text" name="name" id="name" onInput={changeAccount} />
                </div>
                <div class={styles.Input}>
                    <input type="text" name="name" id="name" onInput={changePassword} />
                    <button class={styles.PasswordShow} onClick={() => setShow((prev) => !prev)}>
                        <i class={show() ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"} />
                    </button>
                </div>
            </div>
        </div>
    );
}