import { CST } from "../CST.mjs";

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.LOADINGSCENE });
    }

    preload() {
        // Создаем контейнер для Lottie-анимации
        this.load.spritesheet('loading', './assets/loading.png', {
            frameWidth: 800,
            frameHeight: 800
        });
    }

    create() {
        this.scene.start(CST.SCENE.LOBBYSCENE);
    }
}
