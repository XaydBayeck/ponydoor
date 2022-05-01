import { createMemo, createSignal, For, JSXElement, Match, Setter, Show, Switch } from 'solid-js';
import styles from './UserHome.module.css';
import { User, user, setUser } from '../login/Login';
import axios from 'axios';

export default function MapMode(props: { map: Map<string, string>, key: string }) {
    const keyword = props.key;
    const [map, setMap] = createSignal(props.map)

    const getEs = (map: Map<string, string>) => {
        let components: JSXElement[] = [];

        for (let [k, v] of map) {
            components.push(<EMode k={k} v={v} init="Show" />)
        }

        return components;
    }

    const [getEMs, setEMs] = createSignal(getEs(map()));

    const addE = () => { setMap((prev) => prev.set("new", "new")); setEMs(getEs(map())) };
    return (
        <div class={styles.MapMode} >
            {getEMs()}
            {/* <For each={Array.from(map())}>
                {([key, value]) => <EMode k={key} v={value} init="Show" />}
            </For> */}
            <div class={styles.MMButton}>
                <button class={styles.Submit} onClick={addE}> + </button>
            </div>
        </div>
    )

    type Mode = "Show" | "Change";

    function EMode(props: { k: string, v: string, init: Mode }) {
        const [state, setState] = createSignal("Show" as Mode);
        const [key, setKey] = createSignal(props.k)
        const [val, setVal] = createSignal(props.v)

        const submit = () => {
            setMap((prev) => {
                /* console.log(prev); */
                prev.delete(props.k);
                prev.set(key(), val())
                /* console.log(prev); */
                return prev
            })
            console.log(map());
            console.log(Object.fromEntries(map()));
            axios.post("/user/update", { id: user().id, key: keyword, value: Object.fromEntries(map()) }).then((_r) => {
                axios.get<User>("/user/information")
                    .then((r) => setUser(r.data));
                setEMs(getEs(map()));
                setState("Show");
            })
        }

        return (
            <Switch>
                <Match when={state() == "Show"}>
                    <div class={styles.InfoShow} onclick={() => setState("Change")}>
                        <span>{props.k}</span>
                        <span>{props.v}</span>
                    </div>
                </Match>
                <Match when={state() == "Change"}>
                    <div class={styles.InputGroup}>
                        <input class={styles.MapAttrInput} type="text" name="key" value={key()} onInput={(e) => setKey(e.currentTarget.value)} />
                        <input class={styles.MapAttrInput} type="text" name="value" value={val()} onInput={(e) => setVal(e.currentTarget.value)} />
                        <button class={styles.Submit} onClick={submit}>submit</button>
                        {/* <button onClick={removeE}> - </button> */}
                    </div>
                </Match>
            </Switch>
        )
    }

}
