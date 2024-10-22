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
    DOOR_FORWARD2_ID: 11111112,
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
    ['firstKey', { x: 350, text: 'Brx kdyh irxqg dq rog srwlrq pdnhu\'v gldub wkdw\nghvfulehv wkh iluvw sduw ri srwlrq pdnlqj. Wkh gldub\nvdbv wkdw wr pdnh wkh srwlrq, brx qhhg wr xvh iob\ndjdulf. Rq wkh iluvw gdb kh xvhg 1 iob djdulf, rq wkh\nvhfrqg gdb kh xvhg 3 pruh iob djdulf.' }],
    ['secondKey', { x: 370, text: 'Lq dq rog errn, brx zloo ilqg wkh uhflsh iru wkh vlawk\nsduw ri pdnlqj wkh srwlrq. Wkh errn vdbv wr slfn 5\nohdyhv ri wkh udb wuhh rq wkh iluvw gdb dqg 3 pruh\nohdyhv rq wkh qhaw gdb.' }],
    ['thirdKey', { x: 350, text: 'Lq wkh fruqhu ri wkh ode lv d yldo zlwk dq\nlqvwuxfwlrq vkhhw wkdw ghvfulehv wkh wklug sduw ri\npdnlqj wkh srwlrq. Wkh lqvwuxfwlrqv vdb brx qhhg\n4 whduv iru wkh iluvw vwhs dqg 3 pruh iru wkh\nvhfrqg vwhs.' }],
    ['fourthKey', { x: 420, text: 'Lq wkh fruqhu ri wkh ode, brx irxqg d qrwh wkdw\nghvfulehv wkh vhfrqg sduw ri pdnlqj wkh srwlrq.\nWkh qrwh vdbv wkdw brx qhhg 3 edw zlqjv iru\nwkh srwlrq.' }],
    ['fiverthKey', { x: 350, text: 'Brx kdyh irxqg dq dqflhqw pdqxvfulsw wkdw ghvfulehv\nwkh irxuwk sduw ri pdnlqj d srwlrq. Wkh pdqxvfulsw vdbv\nwkdw wkh srwlrq uhtxluhv wkh xvh ri gudjrq vfdohv. Rqh\nvfdoh lv douhdgb oblqj rq wkh wdeoh. Dffruglqj wr wkh\npdqxvfulsw, wkh vdph dprxqw lv qhhghg wr frpsohwh wkh\nuhflsh.' }],
    ['sixethKey', { x: 390, text: 'Rq rqh ri wkh vkhoyhv, brx ilqg dq dqflhqw vfuroo\nwkdw ghvfulehv wkh iliwk sduw ri srwlrq pdnlqj. Wkh\nvfuroo vdbv wr dgg 2 jhp urrwv dw hdfk vwdjh ri\nsuhsdudwlrq. Wkhuh duh 3 vwdjhv lq wrwdo.' }],
    ['answer', { x: 100, text: 'Frqjudwv!\nBrx’yh pdgh wkh uljkw srwlrq\n“437268”' }]
]);