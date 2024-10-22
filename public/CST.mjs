export const CST = {
    SCENE: {
        LOADINGSCENE: "LoadingScene",
        LOBBYSCENE: "LobbyScene",
        GAMESCENE: "GameScene",
        GAMESCENE2: "GameScene2",
        GAMESCENE3: "GameScene3",
        GAMESCENE4: "GameScene4"
    }
}

export const socket = io();

export const LABEL_ID = {
    DOOR_FORWARD_ID: 11111111,
    DOOR_BACK_ID: 22222222,
    FIRST_KEY: 33333333,
    SECOND_KEY: 44444444,
    THIRD_KEY: 55555555,
    FOURTH_KEY: 6666666,
    FIVETH_KEY: 7777777,
    SIXETH_KEY: 8888888,
    CLUE_KEY: 99999999,
}

export const myMap = new Map([
    ['firstKey', { x: 250, text: '69' }],
    ['secondKey', { x: 250 * 1.7, text: '56' }],
    ['thirdKey', { x: 250 * 2.4, text: '69' }],
    ['fourthKey', { x: 250 * 3, text: '29' }],
    ['fiverthKey', { x: 250 * 3.5, text: '44' }],
    ['sixethKey', { x: 250 * 3.9, text: '62' }],
]);