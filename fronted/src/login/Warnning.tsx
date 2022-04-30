import { For } from 'solid-js';
import styles from './Login.module.css';

export default function Warnning(props: { warnningList: string[] }) {
    return (
        <div class={styles.Warnning}>
            <ul>
                <For each={props.warnningList} fallback={<div>Loading...</div>}>
                    {(item) => <li>{item}</li>}
                </For>
            </ul>
        </div>
    )
}