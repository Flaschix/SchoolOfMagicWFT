import { CST } from "../CST.mjs";
import { socket } from "../CST.mjs";

let player;
let otherPlayers = {};
const hieghtName = 56;
const heightPressX = 90;

export class GameScene3 extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE3 });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        //существует ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;
    }

    preload() {
        //map
        this.load.image('map3', './assets/map/library_room_3.png');
        this.load.image('fiverthKey', 'assets/keyFrame/fiverthKey.png');
        this.load.image('clueKey', 'assets/keyFrame/clueKey.png');
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
        this.createOverlays();

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
            this.map.destroy();
            this.avatarDialog.destroy();
            this.exitContainer.destroy();
            this.enterCodeContainer.destroy();
            let players = data.players;
            this.scene.start(data.scene, { players });
        });
    }

    createMap() {
        this.map = this.add.image(0, 0, 'map3').setOrigin(0, 0);
        this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createUnWalkedObjects() {
        const bodyRightDownWall = this.matter.add.fromVertices(1441 + 80, 1865 + 64, '25.5 104.5 25.5 181 378.5 181 326 104.5 261.5 62.5 114 26 25.5 14 9.5 1.5 1 20.5 9.5 48.5 9.5 83.5', { isStatic: true }, true)
        const bodyLeftDownWall = this.matter.add.fromVertices(1 + 290, 1679 + 170, '550 290.5 557.5 368.5 5 368.5 0.5 153.5 123 153.5 132.5 153.5 173.5 153.5 217 137 233 111 229 83 229 64.5 237 58.5 237 34.5 243 1 251.5 1 251.5 17 259 46.5 263.5 64.5 268.5 114 259 114 259 145.5 251.5 182.5 276 189 280 198 268.5 198 268.5 244 299 260 365 231.5 514 203.5 577.5 191.5 569.5 244 569.5 273', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(944 + 197, 915 + 242, '1753.5 1871 1771 1866 1771 1866 1788.5 1861 1840 1871 1804.5 1856 1782 1829 1782 1788 1782 1769.5 1782 1747 1788.5 1747 1788.5 1718.5 1799 1679.5 1804.5 1679.5 1804.5 1690 1814 1747 1814 1779 1820 1806 1840 1821 1922.5 1829 1928 1685.5 1928 1641 1877.5 1647.5 1850 1641 1814 1626.5 1774.5 1587 1774.5 1577.5 1782 1570 1782 1457.5 1782 1411.5 1782 1393 1782 1373.5 1786.5 1347 1793 1308 1803 1308 1814 1341 1820.5 1360 1814 1393 1814 1411.5 1850 1430.5 1896 1426 1928 1401.5 1928 1360 1935 1270 1935 1028 1817 958 1817 907 1694.5 794.5 1674.5 757 1597 762.5 1592.5 816 1550.5 855.5 1550.5 926 1526.5 952 1513 999 1485.5 1023 1460 999 1460 668 1212.5 668 1190 757 1194.5 995 1168.5 1023 1161 1073.5 1149 1102 1105.5 1102 1096.5 761 1140.5 736 1128.5 561.5 1134 492 1045 384.5 975 384.5 894.5 476.5 894.5 726.5 920.5 749.5 925 1108 874 1108 859.5 1066 831.5 1011 825 761 558.5 756.5 564.5 1005 527 1035.5 466 965.5 475 879.5 458.5 846 376.5 797.5 358.5 802.5 231.5 905.5 231.5 984.5 210 1000.5 152.5 1043 144 1079 115 1104 120 1397.5 130.5 1411 158.5 1431 204.5 1431 225.5 1411 225.5 1397.5 225.5 1379.5 225.5 1359.5 231.5 1347 231.5 1331 231.5 1314 239.5 1303.5 250 1314 250 1331 255.5 1347 263.5 1379.5 263.5 1562.5 276.5 1582.5 225.5 1623 177 1633.5 120 1623 124.5 1827.5 0.5 1827.5 0.5 0.5 2048 0.5 2048 2046 1820.5 2046 1799 2019.5 1774.5 1978.5 1774.5 1935 1774.5 1900.5', { isStatic: true }, true)
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
        // const body1 = this.matter.add.fromVertices(600, 1200, '458.5 105.5 24 105.5 1.5 66.5 6 24.5', {
        //     label: '1',
        //     isStatic: true,
        //     isSensor: true
        // });


        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        // this.matterCollision.addOnCollideStart({
        //     objectA: player,
        //     objectB: [body1, body2, specialZone],
        //     callback: function (eventData) {
        //         this.isInZone = true;
        //         this.eventZone = Number(eventData.bodyB.label);

        //         // Подсвечиваем границы зоны
        //         const vertices = eventData.bodyB.vertices;
        //         highlightGraphics.beginPath();
        //         highlightGraphics.moveTo(vertices[0].x, vertices[0].y);
        //         for (let i = 1; i < vertices.length; i++) {
        //             highlightGraphics.lineTo(vertices[i].x, vertices[i].y);
        //         }
        //         highlightGraphics.closePath();
        //         highlightGraphics.strokePath();
        //     },
        //     context: this
        // });

        // this.matterCollision.addOnCollideEnd({
        //     objectA: player,
        //     objectB: [body1, body2, specialZone],
        //     callback: function (eventData) {
        //         this.isInZone = false;
        //         this.eventZone = null;

        //         highlightGraphics.clear();
        //     },
        //     context: this
        // })

        // // Создаем область, через которую игрок не может пройти
        // const body = this.matter.add.fromVertices(465 + 90, 930 + 90, '', { label: '1', isStatic: true });
        const bodyDoor = this.matter.add.fromVertices(892 + 120, 500 + 90, '0.5 91 0.5 328.5 168.5 328.5 168.5 78.5 139 28.5 84 1.5 27.5 33.5', {
            label: `${DOOR_ID}`,
            isStatic: true,
        });
        const bodyRightBottomTable = this.matter.add.fromVertices(1352 + 90, 1628 + 44, '92 144.5 34.5 133 1 99 1 71.5 11 38 34.5 10 72 1 125.5 10 164 51.5 149.5 118.5', { label: '1', isStatic: true });
        const bodyRightMiddleTable = this.matter.add.fromVertices(1286 + 160, 1189 + 112, '180 1.5 1.5 165.5 124.5 258.5 303 87.5', { label: '1', isStatic: true });

        const bodyRightMiddleShell = this.matter.add.fromVertices(1760 + 98, 990 + 220, '1 260 126.5 339 148.5 282 148.5 64 66 1.5 1 58.5', { label: `${FIVETH_KEY}`, isStatic: true });
        const bodyRightTopShell = this.matter.add.fromVertices(1539 + 90, 760 + 90, '261.5 263.5 170 339.5 19.5 215 16 147 1.5 122.5 61 56.5 48.5 27.5 76 1.5 115 5 152 66.5 266 160', { label: '1', isStatic: true });
        const bodyRightTopBookshell = this.matter.add.fromVertices(1200 + 125, 680 + 154, '254 1 254 327 1 327 1 98.8 18.5154 1', { label: '1', isStatic: true });
        const bodyLeftTopBookshell = this.matter.add.fromVertices(560 + 135, 770 + 122, '270.5 235.5 6 235.5 1 1 263.5 4.5', { label: '1', isStatic: true });
        const bodyLeftMiddleTable = this.matter.add.fromVertices(540 + 110, 1050 + 100, '97 26.5 1 132.5 1 207.5 48 221.5 107.5 207.5 220 103 205 26.5 153 1.5', { label: '1', isStatic: true });
        const bodyLeftTopShell = this.matter.add.fromVertices(249 + 90, 811 + 90, '223.5 178 100 279.5 88 279.5 1 199 1 112 130 1 211 49.5 234.5 89.5', { label: '1', isStatic: true });
        const bodyLeftMiddleShell = this.matter.add.fromVertices(125 + 65, 1020 + 195, '147.5 245 7 339.5 0.5 70 106.5 1.5 147.5 46.5', { label: '1', isStatic: true });
        const bodyLeftBottomTable = this.matter.add.fromVertices(450 + 80, 1622 + 52, '164.5 63.5 144 128.5 107.5 151 62 153.5 25.5 144 0.5 99 0.5 63.5 31.5 22.5 93.5 1 140 22.5', { label: `${CLUE_KEY}`, isStatic: true });

        const arrBodies = [bodyDoor, bodyLeftBottomTable, bodyLeftMiddleShell, bodyLeftTopShell, bodyLeftMiddleTable, bodyLeftTopBookshell, bodyRightBottomTable, bodyRightMiddleTable, bodyRightMiddleShell, bodyRightTopShell, bodyRightTopBookshell];

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


        //Пятый ключ
        this.fiverthKey = this.add.image(0, 0, 'fiverthKey');
        this.fiverthKey.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.fiverthKey.setVisible(false);
        this.fiverthKey.setDepth(2);

        //Лист декода
        this.clueKey = this.add.image(0, 0, 'clueKey');
        this.clueKey.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.clueKey.setVisible(false);
        this.clueKey.setDepth(2);

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
                targets: [this.closeButton, this.overlayBackground, this.emptySign, this.clueKey, this.fiverthKey],
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
                    socket.emit('switchScene', CST.SCENE.GAMESCENE4, 1024, 1850);
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.emptySign, this.clueKey, this.fiverthKey],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.emptySign, this.clueKey, this.fiverthKey],
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
            socket.emit('switchScene', CST.SCENE.GAMESCENE2, 1024, 1024);
        });

        this.input.keyboard.on('keydown-V', () => {
            // console.log(player.x + " " + player.y)
            socket.emit('switchScene', CST.SCENE.GAMESCENE4, 1024, 1024);
        });
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.enterCodeContainer.setVisible(true);
        } else if (this.eventZone == FIVETH_KEY) {
            this.fiverthKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
        }
        else if (this.eventZone == CLUE_KEY) {
            this.clueKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
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
        if (this.eventZone == 0) this.enterCodeContainer.setVisible(false);
        else if (this.eventZone == FIVETH_KEY) this.fiverthKey.setVisible(false);
        else if (this.eventZone == FOURTH_KEY) this.clueKey.setVisible(false);
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
        type: 'rectangle',
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
    newPlayer.setScale(1.3);
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
const FIVETH_KEY = 6666666;
const CLUE_KEY = 77777777;