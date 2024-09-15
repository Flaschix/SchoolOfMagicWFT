export class SocketWorker {

    constructor(socket) {
        this.socket = socket;
        this.lastSentTime = 0;
        this.sendInterval = 75;
    }

    subscribeNewPlayer(context, sceneKey, playerArr, event) {

        this.socket.on(`newPlayer:${sceneKey}`, (playerInfo) => {
            event(context, playerInfo, playerArr);
        });

    }

    subscribePlayerMoved(context, sceneKey, event) {
        this.socket.on(`playerMoved:${sceneKey}`, (playerInfo) => {
            event(context, playerInfo);
        });
    }

    subscribePlayerDisconected(context, event) {
        this.socket.on('playerDisconnected', (id) => {
            event(context, id);
        });
    }

    subscribeSceneSwitched(context, sceneKey, event) {
        this.socket.on('sceneSwitched', (data) => {
            this.unSubscribeAllListeners(sceneKey);
            event(context, data);
        });
    }

    subscribeExistedPlayers(context, event) {
        this.socket.on('exitstedPlayers', (players) => {
            event(context, players);
        });
    }

    subscribeTakeFold(context, event) {
        this.socket.on('takeFold', (arr) => {
            event(context, arr);
        });
    }

    emitSwitchScene(sceneToSwitch, startX, startY) {
        this.socket.emit('switchScene', sceneToSwitch, startX, startY);
    }

    emitPlayerReconnect(newPlayerSettings) {
        this.socket.emit('playerReconnect', newPlayerSettings);
    }

    emitPlayerMovement(sceneKey, playerInfo) {
        const currentTime = Date.now();
        if (currentTime - this.lastSentTime > this.sendInterval) {
            this.socket.emit(`playerMovement:${sceneKey}`, playerInfo);
            this.lastSentTime = currentTime;
        }
    }

    emitGetPlayers() {
        this.socket.emit('getPlayers', null);
    }

    emitGetFold() {
        this.socket.emit('getFold', null);
    }

    emitAddNewImg(img) {
        this.socket.emit('emitAddNewImg', img);
    }

    unSubscribeAllListeners(sceneKey) {
        this.socket.removeAllListeners('playerDisconnected');
        this.socket.removeAllListeners('sceneSwitched');
        this.socket.removeAllListeners('exitstedPlayers');
        this.socket.removeAllListeners('takeFold');
        this.socket.removeAllListeners(`newPlayer:${sceneKey}`);
        this.socket.removeAllListeners(`playerMoved:${sceneKey}`);
    }

    unSubscribeTakeFold() {
        this.socket.removeAllListeners('takeFold');
    }
}