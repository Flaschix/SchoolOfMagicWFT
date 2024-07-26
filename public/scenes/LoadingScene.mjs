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
        this.anims.create({
            key: 'loadingAnimation',
            frames: this.anims.generateFrameNumbers('loading', { start: 0, end: 11 }), // Предполагаем, что у вас 60 кадров
            frameRate: 24, // Скорость анимации (кадров в секунду)
            repeat: -1 // Бесконечный повтор
        });
        this.scene.start(CST.SCENE.LOBBYSCENE);
    }
}
