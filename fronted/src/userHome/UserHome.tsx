import { createSignal, For, JSXElement, Match, onMount, Show, Switch } from 'solid-js';
import styles from './UserHome.module.css';
import { User, user, setUser } from '../login/Login';
import axios from 'axios';
import MapMode from './MapMode';

type UserInfo = "Base" | "Security" | "Detail";

const [userInfo, setUserInfo] = createSignal("Base" as UserInfo);

export default function UserHome() {
    console.log(user());

    onMount(async () => {
        axios.get<User>('/user/information')
            .then((r) => {
                setUser(r.data)
            })
    })

    return (
        <div class={styles.UserHome}>
            <div class={styles.Sidebar}>
                <button class={styles.SideButton} classList={{ [styles.ActiveSideButton]: userInfo() == "Base" }} onClick={() => setUserInfo("Base")}>Base</button>
                <button class={styles.SideButton} classList={{ [styles.ActiveSideButton]: userInfo() == "Security" }} onClick={() => setUserInfo("Security")}>Security</button>
                <button class={styles.SideButton} classList={{ [styles.ActiveSideButton]: userInfo() == "Detail" }} onClick={() => setUserInfo("Detail")}>Detail</button>
            </div>
            <div class={styles.HomeBody}>
                {/* <Show when={user() !== null}>
                    <BaseInfo name={(user() || { name: "" }).name} avatar="" state="visible" account="" />
                </Show> */}
                <Switch>
                    <Match when={userInfo() == "Base"}>
                        <BaseInfo name={user().name} avatar={user().avatar} state={user().state} account={user().account} />
                    </Match>
                    <Match when={userInfo() == "Security"}>
                        <SecurityInfo
                            mail={user().mail || "test@test.com"}
                            contactWays={user().contactWays || new Map([["key1", "val1"]])}
                            passwordQuestions={user().passwordQuastions || new Map([["key1", "val1"]])}
                        />
                    </Match>
                    <Match when={userInfo() == "Detail"}>
                        <DetailInfo
                            description={(user().detailInformation || { description: "A test user." }).description}
                            zone={(user().detailInformation || { zone: "A test place." }).zone}
                            birthday={(user().detailInformation || { birthday: "A test day." }).birthday}
                            bloodtype={(user().detailInformation || { bloodtype: "O" }).bloodtype}
                        />
                    </Match>
                </Switch>
            </div>
        </div>
    );
}

function BaseInfo(props: { name: string, avatar: string, state: string, account: string }) {
    return (
        <div class={styles.BaseInfo}>
            <div class={styles.AvatarBox}>
                {/* <Switch>
                        <Match when={mode() == "Show"}>
                            <img src={props.avatar} alt="Your avatar" height={200} width={200} onClick={() => setMode("Change")} />
                        </Match>
                        <Match when={mode() == "Change"}>
                            <input type="tex" name="avatarUrl" value="avatarUrl" onInput={(e) => setValue(e.currentTarget.value)} />
                            <button onClick={() => submit("avatar", value())}>submit</button>
                        </Match>
                    </Switch> */}
                <ModeTrans key="avatar"
                    show={(nprops) =>
                        <img class={styles.Avatar} src={props.avatar} alt="Your avatar" height={200} width={200} onClick={nprops.onClick} />
                    }
                    input={(nprops) =>
                        <input class={styles.AttrInput} type="tex" name="avatarUrl" value={props.avatar} onInput={nprops.submit} />
                    }
                />
                <ModeTrans key="state"
                    show={(nprops) =>
                        <div class={styles.InfoShow} onclick={nprops.onClick}>
                            <span>state:</span>
                            <span>{props.state}</span>
                        </div>
                    }
                    input={(nproprs) =>
                        <div class={styles.StateSelect}>
                            <select id="userState" name="userState" onChange={nproprs.submit}>
                                <option value="Active">Active</option>
                                <option value="Sleeping">Sleeping</option>
                                <option value="Busy">Busy</option>
                                <option value="Playing">Playing</option>
                            </select>
                        </div>
                    }
                />
            </div>
            <h3 class={styles.Title}>Base Information</h3>
            <div class={styles.Infor}>
                <ModeTrans key="name"
                    show={(nprops) =>
                        <div class={styles.InfoShow} onclick={nprops.onClick}>
                            <span>name:</span><span>{props.name}</span>
                        </div>
                    }
                    input={(nprops) =>
                        <input class={styles.AttrInput} type="tex" name="name" value={props.name} onInput={nprops.submit} />
                    }
                />
                <ModeTrans key="account"
                    show={(nprops) =>
                        <div class={styles.InfoShow} onclick={nprops.onClick}>
                            <span>account:</span><span>{props.account}</span>
                        </div>
                    }
                    input={(nprops) =>
                        <input class={styles.AttrInput} type="tex" name="account" value={props.account} onInput={nprops.submit} />
                    }
                />
            </div>
        </div>
    );
}

function ModeTrans(
    props: {
        key: string,
        show: (props: { onClick: () => void }) => JSXElement,
        input: (props: { submit: (e: { currentTarget: { value: string } }) => void }) => JSXElement
    }) {
    type Mode = "Show" | "Change";
    const [mode, setMode] = createSignal("Show" as Mode);
    const [value, setValue] = createSignal("");

    const submit = (key: string, value: string) => {
        axios.post("/user/update", { id: user().id, key: key, value: value }).then((_r) => {
            axios.get<User>("/user/information")
                .then((r) => setUser(r.data));
            setMode("Show");
        })
    }

    return (
        <Switch>
            <Match when={mode() == "Show"}>
                {props.show({ onClick: () => setMode("Change") })}
            </Match>
            <Match when={mode() == "Change"}>
                <div class={styles.InputGroup}>
                    {props.input({ submit: (e: { currentTarget: { value: string } }) => setValue(e.currentTarget.value) })}
                    <button class={styles.Submit} onClick={() => submit(props.key, value())}>submit</button>
                </div>
            </Match>
        </Switch>
    );
}

function SecurityInfo(props: { mail: string, contactWays: Map<string, string>, passwordQuestions: Map<string, string> }) {

    return (
        <div class={styles.SecurityInfo}>
            <div>
                <h3 class={styles.Title}>Email</h3>
                <ModeTrans key="mail"
                    show={(nprops) =>
                        <div class={styles.InfoShow} onclick={nprops.onClick}>
                            <span>mail:</span><span>{props.mail}</span>
                        </div>
                    }
                    input={(nprops) =>
                        <input class={styles.AttrInput} onInput={nprops.submit} />
                    }
                />
            </div>
            <div>
                <h3 class={styles.Title}>Contact Ways</h3>
                <MapMode map={props.contactWays} key="contactWays" />
            </div>
            <div>
                <h3 class={styles.Title}>Password Questions</h3>
                <MapMode map={props.passwordQuestions} key="passwordQuestions" />
            </div>
        </div>
    );
}

function DetailInfo(props: { description: string, zone: string, birthday: string, bloodtype: string }) {
    type Mode = "Show" | "Change";
    const [mode, setMode] = createSignal("Show" as Mode);
    const [value, setValue] = createSignal(props);

    const submit = (key: string, value: string) => {
        axios.post("/user/update", { id: user().id, key: key, value: value }).then((_r) => {
            axios.get<User>("/user/information")
                .then((r) => setUser(r.data));
            setMode("Show");
        })
    }

    return (
        <div class={styles.DetailInfo}>
            <div class={styles.ShowBox}>
                <h3 class={styles.Title}>Description:</h3>
                <Switch>
                    <Match when={mode() == "Show"}>
                        <div class={styles.InfoShow} onClick={() => setMode("Change")}>{value().description}</div>
                    </Match>
                    <Match when={mode() == "Change"}>
                        <input class={styles.AttrInput} type="text" name="description" value={value().description}
                            onInput={(e) =>
                                setValue((prev) => {
                                    return { ...prev, description: e.currentTarget.value }
                                })}
                        />
                        <button class={styles.Submit} onClick={() => submit("detailInformation", JSON.stringify(value()))}>submit</button>
                    </Match>
                </Switch>
            </div>
            <div class={styles.ShowBox}>
                <h3 class={styles.Title}>Zone:</h3>
                <Switch>
                    <Match when={mode() == "Show"}>
                        <div class={styles.InfoShow} onClick={() => setMode("Change")}>{value().zone}</div>
                    </Match>
                    <Match when={mode() == "Change"}>
                        <input class={styles.AttrInput} type="text" name="zone" value={value().zone}
                            onInput={(e) =>
                                setValue((prev) => {
                                    return { ...prev, zone: e.currentTarget.value }
                                })}
                        />
                        <button class={styles.Submit} onClick={() => submit("detailInformation", JSON.stringify(value()))}>submit</button>
                    </Match>
                </Switch>
            </div>
            <div class={styles.ShowBox}>
                <h3 class={styles.Title}>Birth Day:</h3>
                <Switch>
                    <Match when={mode() == "Show"}>
                        <div class={styles.InfoShow} onClick={() => setMode("Change")}>{value().birthday}</div>
                    </Match>
                    <Match when={mode() == "Change"}>
                        <input class={styles.AttrInput} type="text" name="birthDay" value={value().birthday}
                            onInput={(e) =>
                                setValue((prev) => {
                                    return { ...prev, birth_day: e.currentTarget.value }
                                })}
                        />
                        <button class={styles.Submit} onClick={() => submit("detailInformation", JSON.stringify(value()))}>submit</button>
                    </Match>
                </Switch>
            </div>
            <div class={styles.ShowBox}>
                <h3 class={styles.Title}>Blood Type:</h3>
                <Switch>
                    <Match when={mode() == "Show"}>
                        <div class={styles.InfoShow} onClick={() => setMode("Change")}>{value().bloodtype}</div>
                    </Match>
                    <Match when={mode() == "Change"}>
                        <input class={styles.AttrInput} type="text" name="bloodType" value={value().bloodtype}
                            onInput={(e) =>
                                setValue((prev) => {
                                    return { ...prev, blood_type: e.currentTarget.value }
                                })}
                        />
                        <button class={styles.Submit} onClick={() => submit("detailInformation", JSON.stringify(value()))}>submit</button>
                    </Match>
                </Switch>
            </div>
        </div>
    );
}
