/** @type {import("../typings/phaser")} */
/** @type {import("../typings/PhaserMatterCollisionPlugin")} */

import { LoadingScene } from "./scenes/LoadingScene.mjs"
import { LobbyScene } from "./scenes/LobbyScene.mjs";
import { GameScene } from "./scenes/GameScene.mjs";
import { GameScene2 } from "./scenes/GameScene2.mjs";
import { GameScene3 } from "./scenes/GameScene3.mjs";
import { GameScene4 } from "./scenes/GameScene4.mjs";

let game;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
        parent: 'gameContainer'
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    scene: [LoadingScene, LobbyScene, GameScene, GameScene2, GameScene3, GameScene4],
    dom: {
        createContainer: true
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    }
};

game = new Phaser.Game(config);
