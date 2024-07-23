import { CST } from "../CST.mjs";
import { socket } from "../CST.mjs";

let player;
let otherPlayers = {};
const hieghtName = 35;
const heightPressX = 70;

export class GameScene2 extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE2 });

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
        //map
        this.load.image('map2', './assets/map/map2.png');

    }

    create(data) {
        const { players } = data;

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

        socket.on('sceneSwitched', (players) => {
            this.map.destroy();
            this.avatarDialog.destroy();
            this.exitContainer.destroy();
            this.enterCodeContainer.destroy();
            this.scene.start(CST.SCENE.GAMESCENE, { players });
        });
    }

    createMap() {
        this.map = this.add.image(0, 0, 'map2').setOrigin(0, 0);
        this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createUnWalkedObjects() {
        const bodyMainWall = this.matter.add.fromVertices(976, 1250, '872 1705 872 2042 0.5 2044.5 0.5 1 2045.5 1 2045.5 2048.5 1171.5 2045.5 1171.5 1968 1171.5 1880.5 1171.5 1822.5 1164 1773 1164 1757 1158.5 1709.5 1158.5 1688 1155 1678 1145.5 1656.5 1145.5 1641 1155 1624.5 1158.5 1605.5 1171.5 1595 1183 1605.5 1183 1628 1197.5 1650.5 1205.5 1688 1223 1703.5 1388 1669.5 1401 1641 1431 1661 1498 1757 1521.5 1778 1540 1832 1619 1890 1842 1873.5 1928 1816.5 1987 1734 1967 1701.5 1987 1683.5 1987 1613 1951.5 1596.5 1935.5 1439.5 1928 1345.5 1976.5 1350 1951.5 1336 1928 1308.5 1886 1302.5 1886 1263 1886 1160 1922 1143.5 1922 1084.5 1928 1043.5 1913 865.5 1895 861 1886 853.5 1886 621.5 1548.5 621.5 1548.5 804 1548.5 835 1527.5 847.5 1489.5 847.5 1478 835 1482.5 469 1375 469 1375 823 1345.5 853.5 1315 847.5 1302 810 1166.5 810 1166.5 796 1149 692 1149 535 1123 474 1102 443.5 1051 423 1013 423 948.5 456 909.5 535 897.5 796 889.5 796 828 816 747 784 741 804 736 849 684.5 834.5 676.5 468 567.5 468 553.5 746.5 506.5 756 500.5 618 163.5 618 163.5 786.5 124.5 821.5 114 890.5 86.5 962 86.5 1218 70.5 1279.5 79.5 1279.5 90.5 1250 90.5 1233.5 100 1215.5 114 1213.5 122 1243 131.5 1268.5 142 1288.5 114 1337 106.5 1420.5 96 1490 96 1609 72.5 1759 119.5 1819 169.5 1859 223.5 1879 359 1887.5 398.5 1887.5 427 1859 473 1833 473 1814.5 473 1786 484 1773.5 503 1773.5 551.5 1722 576 1694 614 1673.5 690 1680.5 814.5 1709 832 1694 840 1680.5 851 1667 851 1651.5 856.5 1630 863 1610 872 1600 888.5 1630 909 1651.5 909 1680.5', { isStatic: true }, true);

        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 

        const bodyRightBottomBoxes = this.matter.add.fromVertices(1829 + 80, 1603 + 150, '113.5 5.5 127 1 154.5 10 154.5 76.5 136 102 154.5 135 136 198.5 113.5 198.5 92 195 75.5 203 60.5 212 42 238 20 238 9 230.5 1 206.5 3 195 7.5 188.5 19 182 42 179 51 171 57 164 63.5 162 63.5 102 68.5 67 102 53 107 15.5', { isStatic: true }, true);
        const bodyRightMiddleBoxes = this.matter.add.fromVertices(1827 + 50, 1335 + 136, '90.5 0.5 104.5 13 111.5 177 121 242.5 110 281 99.5 293 69 293 48 277 33.5 250.5 41.5 218 33.5 204.5 23 196.5 9 186 0.5 159.5 0.5 131.5 9 104.5 20 86 14 51 20 13 33.5 0.5', { isStatic: true }, true);
        const bodyRightMiddleTrashTable = this.matter.add.fromVertices(1756 + 74, 865 + 154, '26.5 214.5 21 232 28.5 243 34 247 46 247 53 237.5 58.5 230 65.5 230 75.5 230 78.5 208 102 198 148 198 169 214.5 169 208 172.5 171 165 109 160 1 152.5 1 140 1 118.5 7 102 11.5 90 1 65.5 1 33.5 11.5 26.5 33 26.5 50.5 10 66 1.5 97.5 26.5 131.5 26.5 182.5 21 198 12.5 195 4.5 198 4.5 214.5 21 221.5', { isStatic: true }, true);
        const bodyRightMiddleTable2 = this.matter.add.fromVertices(1587 + 45, 1019 + 80, '90 160 5.5 157.5 1 1.5 90 6', { isStatic: true }, true);
        const bodyRightBottomBookshell = this.matter.add.fromVertices(1384 + 164, 1436 + 108, '19 246 314 251 314 100.5 325.5 100.5 325.5 0.5 0.5 6.5 0.5 91.5 19 100.5', { isStatic: true }, true);
        const bodyRightMiddleTable1 = this.matter.add.fromVertices(1305 + 42, 1027 + 76, '79.5 145.5 0.5 145.5 0.5 0.5 79.5 0.5', { isStatic: true }, true);
        const bodyLeftMiddleTable1 = this.matter.add.fromVertices(648 + 45, 1026 + 76, '86 148.5 0.5 155 0.5 0.5 86 0.5', { isStatic: true }, true);
        const bodyRightTopBookshell = this.matter.add.fromVertices(1551 + 166, 624 + 92, '334 0.5 0.5 0.5 0.5 183 93.5 195 239 195 334 183', { isStatic: true }, true);
        const bodyLeftTopBookshell = this.matter.add.fromVertices(165 + 206, 623 + 167, '87.5 188.5 13 188.5 5 188.5 1 1 338 1 341 132 331.5 153 324.5 188.5 247 188.5 242 191.5 237.5 194.5 228.5 188.5 103 188.5 98.5 198 92 198', { isStatic: true }, true);
        const bodyLeftTopBarrel = this.matter.add.fromVertices(490 + 42, 748 + 66, '72.5 110 40 120 19.5 114.5 5.5 104 1 88 1 68 1 46.5 8 23 14.5 11 29 0.5 61.5 0.5 78 14 84 35 86.5 83.5', { isStatic: true }, true);
        const bodyLeftMiddleTrashTable = this.matter.add.fromVertices(119 + 94, 832 + 76, '143.5 236 6 236 1 236 6 88.5 13 11.5 23.5 1 41 11.5 74 11.5 82 38 92 38 92 23.5 101.5 1 118 1 118 23.5 130 66 151.5 88.5 151.5 169.5 130 195', { isStatic: true }, true);
        const bodyLeftMiddleTable2 = this.matter.add.fromVertices(368 + 46, 981 + 62, '93 197.5 7.5 197.5 1 55 7.5 43.5 33 28.5 33 13.5 45 0.5 59.5 0.5 59.5 23 84.5 55', { isStatic: true }, true);
        const bodyLeftBottomBookshell = this.matter.add.fromVertices(381 + 180, 1443 + 96, '313 241 20 238 10.5 86.5 1 86.5 1 1 326 1 326 86.5 313 99.5', { isStatic: true }, true);
        const bodyLeftBottomTable = this.matter.add.fromVertices(73 + 110, 1610 + 88, '59 5 6.5 1 1 145.5 18.5 175 69.5 225 92 225 127.5 208.5 139 185 139 170.5 151 154.5 155.5 136 155.5 100 151 37 117 27 114 22.5 103 11.5 92 16 85 5', { isStatic: true }, true);
        const bodyRightDoorBookshell = this.matter.add.fromVertices(1374 + 56, 469 + 170, '106.5 348.5 9 348.5 0.5 348.5 0.5 1 9 1 106.5 1', { isStatic: true }, true);
        const bodyLeftDoorBookshell = this.matter.add.fromVertices(558 + 60, 469 + 244, '14.5 303 18 342.5 26 347 123 347 117.5 1 9 1 1 283', { isStatic: true }, true);
        const bodyLeftMiddleBarrel = this.matter.add.fromVertices(112 + 40, 1326 + 66, '48 125.5 9 125.5 1 113 1 85 1 53.5 5 22.5 16 8.5 55.5 1.5 82.5 14.5 88 44 93.5 74.5 79 119', { isStatic: true }, true);
        // const body = this.matter.add.fromVertices(465 + 90, 930 + 90, '', { isStatic: true }, true);
        // const body = this.matter.add.fromVertices(465 + 90, 930 + 90, '', { isStatic: true }, true);
        // const body = this.matter.add.fromVertices(465 + 90, 930 + 90, '', { isStatic: true }, true);
        // const body = this.matter.add.fromVertices(465 + 90, 930 + 90, '', { isStatic: true }, true);
        // const body = this.matter.add.fromVertices(465 + 90, 930 + 90, '', { isStatic: true }, true);
    }

    createPlayers(players) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                player = addPlayer(this, players[id]);
                this.cameras.main.startFollow(player);
                this.cameras.main.setBounds(-100, -12, this.map.width + 125, this.map.height + 24);
            } else {
                addOtherPlayer(this, players[id]);
            }
        });

    }

    createCollision() {
        const bodyDoor = this.matter.add.fromVertices(900 + 107, 672, '26.8986 397.653 31.7546 397.653 40.3874 401 224.375 397.653 233.008 401 242.72 394.863 267 374.222 250.813 218.015 254.051 117.597 241.101 76.8717 203.872 28.3361 170.959 8.81032 143.442 1 107.832 4.34728 67.3651 28.3361 45.783 43.3989 33.9128 58.4616 10.712 105.881 8.55375 122.06 9.63286 132.102 9.63286 198.49 1 377.569', { isStatic: true });


        const body1 = this.matter.add.fromVertices(600, 1200, '458.5 105.5 24 105.5 1.5 66.5 6 24.5', {
            label: '1',
            isStatic: true,
            isSensor: true
        });

        const body2 = this.matter.add.fromVertices(900, 900, '458.5 105.5 24 105.5 1.5 66.5 6 24.5', {
            label: '2',
            isStatic: true,
            isSensor: true
        });

        const specialZone = this.matter.add.fromVertices(900, 700, '70 80 24 105.5 1.5 66.5 6 24.5', {
            label: '0',
            isStatic: true,
            isSensor: true
        });

        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: [body1, body2, specialZone],
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
            objectB: [body1, body2, specialZone],
            callback: function (eventData) {
                this.isInZone = false;
                this.eventZone = null;

                highlightGraphics.clear();
            },
            context: this
        })
    }

    createOverlays(N) {
        this.pressX = this.add.image(player.x, player.y - 50, 'pressX');
        this.pressX.setDisplaySize(this.pressX.width, this.pressX.height);
        this.pressX.setVisible(false);

        //задний фон оверлея
        this.overlayBackground = this.add.image(0, 0, 'overlayBackground');
        this.overlayBackground.setOrigin(0.5, 0.5);
        this.overlayBackground.setDisplaySize(this.cameras.main.width * 0.7, this.cameras.main.height * 0.73);
        this.overlayBackground.setVisible(false);
        this.overlayBackground.setAlpha(0); // Начальное значение прозрачности

        //особая зона с вводом кода над заменить, тк я её вызываю по другому теперь
        let specialZone = this.add.image(0, 0, 'specialZone');
        specialZone.setVisible(false);
        this.overlayImages.push(specialZone);

        this.domContainer = this.add.dom(0, 0).createFromHTML(`
            <div style="text-align: center;">
                <input type="text" id="codeInput" placeholder="Enter code" style="width: 200px; padding: 10px; margin-bottom: 10px;">
                <br>
                <button id="enterButton" style="padding: 10px 20px;">Enter</button>
            </div>
        `);

        this.enterButton = document.getElementById('enterButton');
        this.enterButton.addEventListener('click', () => {
            const codeInput = document.getElementById('codeInput');
            console.log(codeInput.value);
        });

        this.domContainer.setVisible(false);

        for (let i = 1; i <= N; i++) {
            let overlayImage = this.add.image(0, 0, `overlay`);
            overlayImage.setOrigin(0.5, 0.5);
            overlayImage.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
            overlayImage.setVisible(false);
            overlayImage.setDepth(2);
            overlayImage.setAlpha(0); // Начальное значение прозрачности
            this.overlayImages.push(overlayImage);
        }

        this.closeButton = this.add.image(0, 0, 'closeIcon');
        this.closeButton.setDisplaySize(this.overlayBackground.displayWidth * 0.05, this.overlayBackground.displayHeight * 0.07);
        this.closeButton.setInteractive();
        this.closeButton.setVisible(false);
        this.closeButton.setAlpha(0); // Начальное значение прозрачности

        this.closeButton.on('pointerdown', () => {
            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.overlayImages[this.eventZone], this.closeButton, this.domContainer, this.overlayBackground],
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
                    socket.emit('switchScene', CST.SCENE.GAMESCENE, 1024, 1024);
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.overlayImages[this.eventZone], this.closeButton, this.domContainer, this.overlayBackground, this.enterCodeContainer],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.overlayImages[this.eventZone], this.closeButton, this.domContainer, this.overlayBackground, this.enterCodeContainer],
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
            socket.emit('switchScene', CST.SCENE.GAMESCENE, 1024, 1024);
        });
    }

    showOverlay() {
        this.isOverlayVisible = true
        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(player.x, player.y);
            this.enterCodeContainer.setVisible(true);
        } else {
            this.overlayBackground.setPosition(player.x, player.y).setVisible(true);
            this.overlayImages[this.eventZone].setPosition(player.x, player.y + 20).setVisible(true);

            this.closeButton.setPosition(
                player.x + this.overlayBackground.displayWidth / 2 - this.overlayBackground.displayWidth * 0.1 / 2 + 10,
                player.y - this.overlayBackground.displayHeight / 2 + this.overlayBackground.displayHeight * 0.1 / 2,
            ).setVisible(true);
        }
    }

    hideOverlay() {
        this.isOverlayVisible = false
        if (this.eventZone == 0) this.enterCodeContainer.setVisible(false);
        else {
            this.overlayBackground.setVisible(false);
            this.overlayImages[this.eventZone].setVisible(false);
            this.closeButton.setVisible(false);
        }
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
            this.avatarDialog.setPosition(player.x, player.y);
            this.avatarDialog.setVisible(true);
            this.isOverlayVisible = true
            player.setVelocity(0);
        });
        exitButton.addEventListener('click', () => {
            console.log('exitButton button clicked');
            this.exitContainer.setPosition(player.x, player.y);
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

        this.exitContainer.setOrigin(2, 1);
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
        socket.emit(`playerMovement:${CST.SCENE.GAMESCENE2}`, { x: player.x, y: player.y, velocityX: player.body.velocity.x, velocityY: player.body.velocity.y });
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
    newPlayer.character = playerInfo.character;
    newPlayer.name = playerInfo.name;
    newPlayer.setBounce(0); // настройка упругости
    newPlayer.setFrictionAir(0); // настройка сопротивления воздуха


    const colliderWidth = 22; // 80% от ширины спрайта
    const colliderHeight = 25; // 80% от высоты спрайта
    newPlayer.setBody({
        type: 'rectangle',
        width: colliderWidth,
        height: colliderHeight
    });
    newPlayer.setOrigin(0.5, 0.65);


    // Добавляем текст с именем игрока
    newPlayer.nameText = self.add.text(newPlayer.x, newPlayer.y - hieghtName, newPlayer.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    newPlayer.setFixedRotation();
    //////////////////////////////////////////////////////

    return newPlayer;
}

function addOtherPlayer(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, `character${playerInfo.character}`);
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
