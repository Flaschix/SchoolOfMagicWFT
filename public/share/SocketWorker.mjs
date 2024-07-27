export class SocketWorker {

    constructor(socket) {
        this.socket = socket;
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

    subscribePlayerDisconected(event) {
        this.socket.on('playerDisconnected', (id) => {
            event(id);
        });
    }

    subscribeSceneSwitched(context, sceneKey, event) {
        this.socket.on('sceneSwitched', (data) => {
            this.unSubscribeAllListeners(sceneKey);
            event(context, data);
        });
    }

    emitSwitchScene(sceneToSwitch, startX, startY) {
        this.socket.emit('switchScene', sceneToSwitch, startX, startY);
    }

    emitPlayerReconnect(newPlayerSettings) {
        this.socket.emit('playerReconnect', newPlayerSettings);
    }

    emitPlayerMovement(sceneKey, playerInfo) {
        this.socket.emit(`playerMovement:${sceneKey}`, playerInfo);
    }

    unSubscribeAllListeners(sceneKey) {
        this.socket.removeAllListeners('playerDisconnected');
        this.socket.removeAllListeners('sceneSwitched');
        this.socket.removeAllListeners(`newPlayer:${sceneKey}`);
        this.socket.removeAllListeners(`playerMoved:${sceneKey}`);
    }
}