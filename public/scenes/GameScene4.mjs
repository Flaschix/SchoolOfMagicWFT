import { CST } from "../CST.mjs";
import { socket } from "../CST.mjs";

let player;
let otherPlayers = {};
const hieghtName = 56;
const heightPressX = 90;
let fullMap = true;

export class GameScene4 extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE4 });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        //массив изображений оверлея
        this.overlayImages = [];

        //существует ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;
    }

    preload() {

        this.anims.create({
            key: 'loadingAnimation',
            frames: this.anims.generateFrameNumbers('loading', { start: 0, end: 11 }), // Предполагаем, что у вас 60 кадров
            frameRate: 24, // Скорость анимации (кадров в секунду)
            repeat: -1 // Бесконечный повтор
        });

        // Создание спрайта и запуск анимации
        this.loadingSprite = this.add.sprite(1280 / 2, 720 / 2, 'loading'); // Центрирование спрайта
        this.loadingSprite.play('loadingAnimation');

        //map
        this.load.image('map4', './assets/map/library_room_4.png');
        this.load.image('doorRoom4', './assets/map/door_room_4.png');
        this.load.image('tableRoom4', './assets/map/table_room_4.png');
        this.load.image('sixethKey', 'assets/keyFrame/sixethKey.png');

    }

    create(data) {
        const { players } = data;

        this.loadingSprite.stop();
        this.loadingSprite.destroy();

        // Добавляем карту
        this.createMap();


        this.createUIRight();
        this.createUITop();
        this.createUIBottom();
        this.createUI();
        this.createExitButton();

        //Создаём стены и остальные непроходимые объекты
        this.createUnWalkedObjects();

        //Создаём игроков
        this.createPlayers(players);

        //Создаём курсор для обработки инпутов пользователя
        this.cursors = this.input.keyboard.createCursorKeys();

        //Создаём объект с которыми будем взаимодействовать
        this.createCollision();

        //Создание оверлея
        this.createOverlays(2);

        //Создание слушателей нажатия кнопок
        this.createInputHandlers();



        socket.on(`newPlayer:${this.scene.key}`, (playerInfo) => {
            addOtherPlayer(this, playerInfo);
        });

        socket.on(`playerMoved:${this.scene.key}`, (playerInfo) => {
            if (otherPlayers[playerInfo.id]) {
                otherPlayers[playerInfo.id].setPosition(playerInfo.x, playerInfo.y);
                updateAnimation(otherPlayers[playerInfo.id], playerInfo);
            }
        });

        socket.on('playerDisconnected', (id) => {
            if (otherPlayers[id]) {
                otherPlayers[id].nameText.destroy();
                otherPlayers[id].destroy();
                delete otherPlayers[id];
            }
        });

        this.createAvatarDialog();

        this.createEnterCodeContainer();

        socket.on('sceneSwitched', (data) => {
            this.removeAllListerners();
            this.map.destroy();
            this.avatarDialog.destroy();
            this.exitContainer.destroy();
            this.enterCodeContainer.destroy();
            let players = data.players;
            this.scene.start(data.scene, { players });
        });

        if (!this.textures.exists('mapFull4')) {
            this.load.image('mapFull4', './assets/map/library_room_4_full.png');

            // Начало загрузки
            this.load.start();

            fullMap = false;
        }
    }

    removeAllListerners() {
        socket.removeAllListeners('playerDisconnected');
        socket.removeAllListeners('sceneSwitched');
        socket.removeAllListeners(`newPlayer:${this.scene.key}`);
        socket.removeAllListeners(`playerMoved:${this.scene.key}`);
    }

    createMap() {
        if (this.textures.exists('mapFull4')) {
            this.map = this.add.image(0, 0, 'mapFull4').setOrigin(0, 0);
            this.map.setScale(4 / 3, 4 / 3);
            this.matter.world.setBounds(0, 0, this.map.width * 4 / 3, this.map.height * 4 / 3);
        } else {
            this.map = this.add.image(0, 0, 'map4').setOrigin(0, 0);
            this.map.setScale(2, 2);
            this.matter.world.setBounds(0, 0, this.map.width * 2, this.map.height * 2);
        }
        this.add.image(1040, 1960, 'doorRoom4');
        this.add.image(1024, 596, 'tableRoom4');
        // this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
        // this.map.setScale(2, 2);
        // this.matter.world.setBounds(0, 0, this.map.width * 2, this.map.height * 2);
    }

    createUnWalkedObjects() {
        const bodyLeftMiddleWall = this.matter.add.fromVertices(150 + 296, 1400 + 162, '787.5 415 749 385 737.5 343 712 335.5 649 318.5 587 253.5 538.5 207.5 458.5 186 372.5 186 308.5 214 258 250.5 230 339 157.5 339 136 292.5 109 263 62 254.5 29 263 11.5 300 6 347.5 1 347.5 1 36.5 612.5 36.5 612.5 1 749 61.5 787.5 36.5 823 69.5 809 92 809 343 835 378.5', { isStatic: true }, true)
        const bodyRightMiddleShell = this.matter.add.fromVertices(1450 + 472, 1152 + 140, '82 4 110.5 18.5 106.5 12.5 198 18.5 199.5 1029.5 180 1029.5 184.5 383.5 45 383.5 32 377.5 20.5 377.5 17.5 338.5 1 335.5 1 239.5 17.5 235.5 32 216 38.5 54 24 49 20 25.5 24 12.5 47.5 1', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(1120, 620, '896 986 886 973 873 912.5 828 883.5 770.5 883.5 755 860.5 730.5 856 718.5 810.5 730.5 793 736 772 741.5 740 718.5 740 682.5 714 661.5 728 661.5 631 674.5 583.5 667 400.5 563.5 285.5 421 275 308.5 318 240 431.5 253.5 690 209.5 699.5 209.5 799.5 166.5 810.5 172 945.5 135 984 154 1040 221 1071 221 1276 215.5 1305.5 229.5 1352 172 1334.5 154 1389.5 1 1394 14.5 0.5 2038 0.5 2038 1024.5 1941.5 1014.5 1932 922 1878 928.5 1849 928.5 1844 941 1828.5 941 1816.5 933.5 1828.5 909 1823.5 895.5 1807.5 880.5 1828.5 842.5 1837 842.5 1844 861.5 1851 883.5 1841.5 893.5 1851 909 1870.5 902.5 1875.5 883.5 1875.5 872.5 1892 856 1878 809.5 1832.5 802 1828 702 1859 702 1868.5 371.5 1859 358.5 1849.5 351.5 1846 358.5 1835.5 351.5 1840.5 344 1846 332 1840.5 327 1835.5 327 1832.5 321.5 1849.5 298.5 1826.5 273 1746.5 227.5 1731.5 294.5 1637 260.5 1571.5 250.5 1459 286.5 1380.5 326.5 1391.5 611 1369 710 1319.5 743 1319.5 815.5 1284 884.5 1201 859.5 1159.5 890.5 1159.5 952 1135 978 1110.5 972 1110.5 879.5 1246.5 749 1243 717 1243 697.5 1258.5 670 1262.5 660 1270.5 624.5 1268.5 565 1268.5 542 1277.5 367.5 1260 361 1249 355 1249 343 1256 337.5 1249 331 1249 326.5 1253 320.5 1256 309 1267.5 304.5 1246.5 279.5 1202.5 234.5 1177.5 220 996 180 900.5 207.5 775 290 795.5 314 787 338 795.5 343.5 787 355.5 779.5 355.5 767 367.5 775 631 787 636 803.5 663 809 685.5 803.5 728 806.5 740 814.5 755 818.5 761 828 766 832.5 772 841.5 779 861 781.5 870 776 875.5 781.5 886 781.5 905 795 912.5 810.5 920 823 927.5 821.5 942.5 828.5 958.5 847 951.5 870.5 951.5 916.5 929.5 935.5 929.5 969.5 919.5 986', { isStatic: true }, true)
        const bodyRightMiddleWall = this.matter.add.fromVertices(1450 + 170, 1400 + 168, '35.5 412 82 390.5 86 366.5 73 351.5 73 219.5 108.5 190.5 154.5 174.5 174 190.5 310.5 196 367 196 427.5 190.5 471.5 196 546.5 240 591.5 289 604.5 356.5 636.5 356.5 644.5 351.5 651 308.5 662 289 688.5 268.5 723.5 256 776.5 274 791 351.5 805 351.5 805 40 188.5 40 183.5 1.5 93 55.5 63 35.5 35.5 35.5 14.5 67.5 23 95.5 23 348.5 11 351.5 1.5 378', { isStatic: true }, true)
        const bodyLeftBottomWall = this.matter.add.fromVertices(10, 1400 + 340, '25 641 1 641 2.5 0.5 22 0.5', { isStatic: true }, true)
    }

    createPlayers(players) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                player = addPlayer(this, players[id]);
                this.cameras.main.startFollow(player);
                if (this.textures.exists('mapFull4')) this.cameras.main.setBounds(-100, -12, this.map.width * 4 / 3 + 125, this.map.height * 4 / 3 + 24);
                else this.cameras.main.setBounds(-100, -12, this.map.width * 2 + 125, this.map.height * 2 + 24);
            } else {
                addOtherPlayer(this, players[id]);
            }
        });

    }

    createCollision() {
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const bodyMiddleTopTable = this.matter.add.fromVertices(804 + 225, 608, '1 1 1 181 454 181 454 1', { label: '0', isStatic: true });


        const bodyLeftTopBookShell = this.matter.add.fromVertices(250 + 206, 392 + 146, '374 409 1 409 1 165.5 51.5 59.5 191.5 1 338 59.5 374 165.5', { label: '1', isStatic: true });
        const bodyLeftTable1 = this.matter.add.fromVertices(250 + 192, 392 + 410, '190.5 95.5 1 91.5 1 0.5 190.5 0.5', { label: '1', isStatic: true });
        const bodyLeftTable2 = this.matter.add.fromVertices(250 + 200, 392 + 590, '252.5 1 4.5 1 1.5 90.5 248.5 87.5', { label: '1', isStatic: true });
        const bodyLeftTable3 = this.matter.add.fromVertices(250 + 214, 392 + 732, '272 0.5 1 0.5 1 82.5 267 87.5', { label: '1', isStatic: true });
        const bodyLeftTable4 = this.matter.add.fromVertices(250 + 196, 392 + 880, '243 1 1 1 1 87.5 246.5 87.5', { label: `${SIXETH_KEY}`, isStatic: true });

        const bodyLeftMiddleBookshell = this.matter.add.fromVertices(1500 + 168, 392 + 950, '189 2 0.5 0.5 2 125.5 191.5 125.5', { label: '1', isStatic: true });
        const bodyRightTable3 = this.matter.add.fromVertices(1500 + 116, 392 + 680, '412.5 71.5 1 71.5 5.5 0.5 412.5 0.5', { label: '1', isStatic: true });
        const bodyRightTable2 = this.matter.add.fromVertices(1500 + 48, 392 + 540, '309.5 42.5 251.5 80 26.5 80 1.5 42.5 26.5 0.5 256.5 0.5', { label: '1', isStatic: true });
        const bodyRightTable1 = this.matter.add.fromVertices(1500 + 112, 390 + 380, '275.5 70 1 70 11 1 275.5 1', { label: '1', isStatic: true });
        const bodyRightTopBookshell = this.matter.add.fromVertices(1500 + 96, 392 + 160, '1 162.5 1 395 384 395 384 162.5 328.5 54.5 188.5 1 61 54.5', { label: '1', isStatic: true });

        const bodyDoor = this.matter.add.fromVertices(942 + 86, 1900 + 80, '8 130.5 1 190.5 544.5 190.5 508.5 142.5 422.5 62.5 309 0.5 217 0.5 115.5 56.5', {
            label: `${DOOR_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyDoor, bodyLeftTopBookShell, bodyMiddleTopTable, bodyRightTable3, bodyRightTable2, bodyRightTable1, bodyRightTopBookshell, bodyLeftMiddleBookshell, bodyLeftTable1, bodyLeftTable2, bodyLeftTable3, bodyLeftTable4]

        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: arrBodies,
            callback: function (eventData) {
                this.isInZone = true;
                this.eventZone = Number(eventData.bodyB.label);

                // Подсвечиваем границы зоны
                const vertices = eventData.bodyB.vertices;
                highlightGraphics.beginPath();
                highlightGraphics.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                    highlightGraphics.lineTo(vertices[i].x, vertices[i].y);
                }
                highlightGraphics.closePath();
                highlightGraphics.strokePath();
            },
            context: this
        });

        this.matterCollision.addOnCollideEnd({
            objectA: player,
            objectB: arrBodies,
            callback: function (eventData) {
                this.isInZone = false;
                this.eventZone = null;

                highlightGraphics.clear();
            },
            context: this
        });
    }

    createOverlays() {
        this.pressX = this.add.image(player.x, player.y - 50, 'pressX');
        this.pressX.setDisplaySize(this.pressX.width, this.pressX.height);
        this.pressX.setVisible(false);

        //задний фон оверлея
        this.overlayBackground = this.add.image(0, 0, 'overlayBackground');
        this.overlayBackground.setOrigin(0.5, 0.5);
        this.overlayBackground.setDisplaySize(this.cameras.main.width * 0.7, this.cameras.main.height * 0.73);
        this.overlayBackground.setVisible(false);
        this.overlayBackground.setAlpha(0); // Начальное значение прозрачности

        //Шестой ключ
        this.sixethKey = this.add.image(0, 0, 'sixethKey');
        this.sixethKey.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.sixethKey.setVisible(false);
        this.sixethKey.setDepth(2);

        //Текст для пустых
        this.emptySign = this.add.image(0, 0, 'empty');
        this.emptySign.setVisible(false);
        this.emptySign.setDepth(2);

        this.closeButton = this.add.image(0, 0, 'closeIcon');
        this.closeButton.setDisplaySize(this.overlayBackground.displayWidth * 0.05, this.overlayBackground.displayHeight * 0.07);
        this.closeButton.setInteractive();
        this.closeButton.setVisible(false);
        this.closeButton.setAlpha(0); // Начальное значение прозрачности

        this.closeButton.on('pointerdown', () => {
            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.closeButton, this.overlayBackground, this.sixethKey, this.emptySign],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    try {
                        this.hideOverlay();
                    }
                    catch (e) { }
                }
            });
        });
    }

    createInputHandlers() {
        this.input.keyboard.on('keydown-X', () => {
            if (this.isInZone) {
                player.setVelocity(0);
                console.log(this.eventZone);

                if (this.eventZone == DOOR_ID) {
                    this.isInZone = false;
                    this.eventZone = null;
                    socket.emit('switchScene', CST.SCENE.GAMESCENE3, 1024, 800);
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.sixethKey, this.emptySign],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.sixethKey, this.emptySign],
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            try {
                                this.hideOverlay();
                            } catch (e) { }

                        }
                    });
                }
            }
        });

        this.input.keyboard.on('keydown-C', () => {
            // console.log(player.x + " " + player.y)
            socket.emit('switchScene', CST.SCENE.GAMESCENE3, 1024, 1024);
        });
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.enterCodeContainer.setVisible(true);
            return;
        } else if (this.eventZone == SIXETH_KEY) {
            this.sixethKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
        }
        else {
            this.emptySign.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);;
        }

        this.overlayBackground.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
        this.closeButton.setPosition(
            this.cameras.main.scrollX + 640 + this.overlayBackground.displayWidth / 2 - this.overlayBackground.displayWidth * 0.1 / 2 + 10,
            this.cameras.main.scrollY + 360 - this.overlayBackground.displayHeight / 2 + this.overlayBackground.displayHeight * 0.1 / 2,
        ).setVisible(true);
    }

    hideOverlay() {
        this.isOverlayVisible = false
        if (this.eventZone == 0) {
            this.enterCodeContainer.setVisible(false);
            return;
        }
        else if (this.eventZone == SIXETH_KEY) this.sixethKey.setVisible(false);
        else {
            this.emptySign.setVisible(false);
        }
        this.overlayBackground.setVisible(false);
        this.closeButton.setVisible(false);
    }

    createUI() {
        // Создаем контейнер для HTML элементов
        const uiContainer = this.add.dom(50, this.cameras.main.height / 2).createFromHTML(`
                <div class="container">
        <img class="game-logo" src="./assets/icon/logo.png" alt="Company Logo">
        <div class="game-buttons">
            <input class="gamebutton" id="settingsButton" type="image" src="./assets/icon/settings.png" alt="Кнопка «input»">
            <input class="gamebutton" id="exitButton" type="image" src="./assets/icon/exit.png" alt="Кнопка «input»">
        </div>
    </div>
        `);

        // Добавляем обработчик события для кнопки настроек
        const settingsButton = document.getElementById('settingsButton');
        const exitButton = document.getElementById('exitButton');
        settingsButton.addEventListener('click', () => {
            console.log('Settings button clicked');
            this.avatarDialog.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.avatarDialog.setVisible(true);
            this.isOverlayVisible = true
            player.setVelocity(0);
        });
        exitButton.addEventListener('click', () => {
            console.log('exitButton button clicked');
            this.exitContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.exitContainer.setVisible(true);
            this.isOverlayVisible = true
            player.setVelocity(0);
        });

        // Настраиваем стили контейнера
        // uiContainer.setDisplaySize(100, this.cameras.main.height);
        uiContainer.setOrigin(0.5, 0.5);
        uiContainer.setScrollFactor(0); // Чтобы контейнер не двигался вместе с камерой
    }

    createUIRight() {
        // Создаем контейнер для HTML элементов
        const uiContainer = this.add.dom(this.cameras.main.width, this.cameras.main.height / 2).createFromHTML(`
            <div style="text-align: center;background:#0F0920;height: 720px; width: 50px">
            </div>
        `);

        // Настраиваем стили контейнера
        // uiContainer.setDisplaySize(100, this.cameras.main.height);
        uiContainer.setOrigin(0.5, 0.5);
        uiContainer.setScrollFactor(0); // Чтобы контейнер не двигался вместе с камерой
    }

    createUITop() {
        // Создаем контейнер для HTML элементов
        const uiContainer = this.add.dom(this.cameras.main.width / 2, 0).createFromHTML(`
            <div style="text-align: center;background:#0F0920;height: 24px; width: 1280px">
            </div>
        `);

        // Настраиваем стили контейнера
        uiContainer.setOrigin(0.5, 0.5);
        uiContainer.setScrollFactor(0); // Чтобы контейнер не двигался вместе с камерой
    }

    createUIBottom() {
        // Создаем контейнер для HTML элементов
        const uiContainer = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height).createFromHTML(`
            <div style="text-align: center;background:#0F0920;height: 24px; width: 1280px">
            </div>
        `);

        // Настраиваем стили контейнера
        uiContainer.setOrigin(0.5, 0.5);
        uiContainer.setScrollFactor(0); // Чтобы контейнер не двигался вместе с камерой
    }

    createExitButton() {
        this.exitContainer = this.add.dom(0, 0).createFromHTML(`
<div class="exit-container">
    <input type="image" src="./assets/button/leave-space.png" alt="Leave space" class="exit-button" id="leave-space">
    <input type="image" src="./assets/button/cancel-exit.png" alt="Close" class="exit-button" id="close-btn">
</div>
    `);
        const leaveBtn = document.getElementById('leave-space');
        leaveBtn.addEventListener('click', () => {

            //Поменяй на нормальный способ
            window.location.replace("http://localhost:3000/");
        });


        const closeBtn = document.getElementById('close-btn');
        closeBtn.addEventListener('click', () => {
            this.exitContainer.setVisible(false);
            this.isOverlayVisible = false
        });

        // this.exitContainer.setOrigin(2, 1);
        this.exitContainer.setVisible(false);
    }

    createAvatarDialog() {
        this.avatarDialog = this.add.dom(0, 0).createFromHTML(`
	<div id="avatarDialog">
        <h2>Choose avatar</h2>
        <div id="avatarContainer">
            <img src="./assets/character/man1.png" class="avatar" data-index="0">
            <img src="./assets/character/man2.png" class="avatar" data-index="1">
            <img src="./assets/character/man3.png" class="avatar" data-index="2">
            <img src="./assets/character/woman1.png" class="avatar" data-index="3">
            <img src="./assets/character/woman2.png" class="avatar" data-index="4">
            <img src="./assets/character/woman3.png" class="avatar" data-index="5">
        </div>
        <div id="usernameContainer">
            <label for="usernameInput">Name</label>
            <div id="inputContainer">
                <input type="text" id="usernameInput" placeholder="Enter your name">
                <img src="./assets/icon/pen.png" id="penIcon">
            </div>
        </div>
        <label id="incorrectName">Incorrect name
*the name must be 1-12 characters</label>
        <input type="image" src="./assets/button/join.png" id="joinBtn">
        <input type="image" src="./assets/button/back.png" id="backBtn">
    </div>
            `);
        this.avatarDialog.setVisible(false);

        this.avatarDialog.setOrigin(0.5, 0.5);

        const avatars = document.querySelectorAll('#avatarContainer .avatar');
        let selectedAvatar = avatars[0]; // По умолчанию выделяем первый аватар
        let imgCount = 0;

        // Добавляем класс выделения первому аватару
        selectedAvatar.classList.add('selected');

        avatars.forEach(avatar => {
            avatar.addEventListener('click', function () {
                // Убираем класс выделения с предыдущего аватара
                selectedAvatar.classList.remove('selected');
                // Добавляем класс выделения новому аватару
                avatar.classList.add('selected');
                // Обновляем ссылку на текущий выделенный аватар
                selectedAvatar = avatar;
                imgCount = Number(avatar.dataset.index);
                console.log(imgCount);
            });
        });

        const nameInput = document.getElementById('usernameInput');
        const nameError = document.getElementById('incorrectName');

        const avatarDialogJoin = document.getElementById('joinBtn');
        avatarDialogJoin.addEventListener('click', () => {
            const username = nameInput.value;
            if (username.length < 1 || username.length > 12) {
                nameError.style.visibility = "visible";
            } else {
                socket.emit('playerReconnect', { x: player.x, y: player.y, avatar: imgCount + 1, name: username });
                player.setTexture(`character${imgCount + 1}`);
                player.character = imgCount + 1;
                player.nameText.setText(username);
                this.avatarDialog.setVisible(false);
                this.isOverlayVisible = false;

                nameError.style.visibility = "hidden";
            }
        });

        const avatarDialogBack = document.getElementById('backBtn');
        avatarDialogBack.addEventListener('click', () => {
            this.avatarDialog.setVisible(false);
            this.isOverlayVisible = false;
        });

    }

    createEnterCodeContainer() {
        this.enterCodeContainer = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(`
    <div class="enterCodeContainer">
        <div id="enterCodeDialog">
            <h2 id="enterCodeTitle">Enter code</h2>
            <div id="codeInputs">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
            </div>
            <input id="join-room-connect" class="connect-space-button" type="image" src="./assets/button/join2.png" alt="Connect">
            <input id="join-room-cancel" class="connect-space-button" type="image" src="./assets/button/cancel.png" alt="Cancel">
        </div>
    </div>
                `);

        this.enterCodeContainer.setOrigin(0.5, 0.5);
        const inputsContainer = document.getElementById('codeInputs')
        const titleContainer = document.getElementById('enterCodeTitle')

        const inputs = document.querySelectorAll('#codeInputs input');

        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
        });

        const correctCode = '111111';
        let correctFlag = true;

        const joinRoomConnect = document.getElementById('join-room-connect');
        joinRoomConnect.addEventListener('click', () => {
            if (correctFlag) {
                let code = '';

                inputs.forEach(input => {
                    code += input.value;
                });

                if (code == correctCode) console.log(code);
                else {
                    inputsContainer.style.display = 'none';
                    titleContainer.innerHTML = 'Incorrect code';
                    titleContainer.style.color = 'red';
                    joinRoomConnect.src = './assets/button/try-again.png';
                    correctFlag = false
                }
            } else {
                inputsContainer.style.display = 'flex';
                titleContainer.innerHTML = 'Enter code';
                titleContainer.style.color = '#F2F0FF';
                joinRoomConnect.src = './assets/button/join2.png';
                correctFlag = true
            }



            // socket.emit('checkRoom', code);
        });

        const joinRoomCancel = document.getElementById('join-room-cancel');
        joinRoomCancel.addEventListener('click', () => {
            // this.enterCodeContainer.setVisible(false);
            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.enterCodeContainer],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    try {
                        this.hideOverlay();
                    }
                    catch (e) { }
                }
            });
            // this.welcomeContainer.setVisible(true);
        });

        this.enterCodeContainer.setVisible(false);
    }

    update() {
        if (!player || this.isOverlayVisible) return;

        this.updatePlayerPosition();

        this.updatePressXVisibility();

        if (!fullMap) {
            if (this.textures.exists('mapFull4')) {
                fullMap = true;
                this.map.setScale(4 / 3, 4 / 3);

                this.map.setTexture('mapFull4');
                this.matter.world.setBounds(0, 0, this.map.width * 4 / 3, this.map.height * 4 / 3);
            }
        }
    }

    updatePlayerPosition() {
        player.setVelocity(0);
        if (this.cursors.left.isDown) {
            player.setVelocityX(-5);
            player.anims.play(`walk_left${player.character}`, true);
        } else if (this.cursors.right.isDown) {
            player.setVelocityX(5);
            player.anims.play(`walk_right${player.character}`, true);
        } else if (this.cursors.up.isDown) {
            player.setVelocityY(-5);
            player.anims.play(`walk_up${player.character}`, true);
        } else if (this.cursors.down.isDown) {
            player.setVelocityY(5);
            player.anims.play(`walk_down${player.character}`, true);
        } else {
            player.anims.stop();
        }

        //Рисуем ник игрока
        player.nameText.setPosition(player.x, player.y - hieghtName);

        //Передаем данные о передвижение игрока на сервер
        socket.emit(`playerMovement:${this.scene.key}`, { x: player.x, y: player.y, velocityX: player.body.velocity.x, velocityY: player.body.velocity.y });
    }

    updatePressXVisibility() {
        if (this.isInZone) {
            this.pressX.setPosition(player.x, player.y - heightPressX);
            this.pressX.setVisible(true);
        } else {
            this.pressX.setVisible(false);
        }
    }

}

function addPlayer(self, playerInfo) {
    console.log(playerInfo.character);
    const newPlayer = self.matter.add.sprite(playerInfo.x, playerInfo.y, `character${playerInfo.character}`);
    newPlayer.setScale(1.3);
    newPlayer.character = playerInfo.character;
    newPlayer.name = playerInfo.name;
    newPlayer.setBounce(0); // настройка упругости
    newPlayer.setFrictionAir(0); // настройка сопротивления воздуха


    const colliderWidth = 22; // 80% от ширины спрайта
    const colliderHeight = 25; // 80% от высоты спрайта
    newPlayer.setBody({
        type: 'circle',
        width: colliderWidth,
        height: colliderHeight
    });
    newPlayer.setOrigin(0.5, 0.7);


    // Добавляем текст с именем игрока
    newPlayer.nameText = self.add.text(newPlayer.x, newPlayer.y - hieghtName, newPlayer.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    newPlayer.setFixedRotation();
    //////////////////////////////////////////////////////

    return newPlayer;
}

function addOtherPlayer(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, `character${playerInfo.character}`);
    otherPlayer.setScale(1.3);
    // const otherPlayer = self.matter.add.sprite(playerInfo.x, playerInfo.y, `character${playerInfo.character}`); //это если нужно будет взаимодействие
    otherPlayer.character = playerInfo.character;
    otherPlayer.name = playerInfo.name;

    // Установить статическую физику для других игроков
    // otherPlayer.setStatic(true);

    // Добавляем текст с именем игрока
    otherPlayer.nameText = self.add.text(otherPlayer.x, otherPlayer.y - hieghtName, otherPlayer.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);

    //Убираем вращение при столкновении с объектами
    // otherPlayer.setFixedRotation();

    otherPlayers[playerInfo.id] = otherPlayer;
}


function updateAnimation(playerSprite, playerInfo) {
    if (playerInfo.velocityX < 0) {
        playerSprite.anims.play(`walk_left${playerSprite.character}`, true);
    } else if (playerInfo.velocityX > 0) {
        playerSprite.anims.play(`walk_right${playerSprite.character}`, true);
    } else if (playerInfo.velocityY < 0) {
        playerSprite.anims.play(`walk_up${playerSprite.character}`, true);
    } else if (playerInfo.velocityY > 0) {
        playerSprite.anims.play(`walk_down${playerSprite.character}`, true);
    } else {
        playerSprite.anims.stop();
    }

    // Обновляем позицию текста с именем
    playerSprite.nameText.setPosition(playerSprite.x, playerSprite.y - hieghtName);
}

const DOOR_ID = 11111111;
const SIXETH_KEY = 77777777;