import { CST } from "../CST.mjs";
import { socket } from "../CST.mjs";

let player;
let otherPlayers = {};
const hieghtName = 56;
const heightPressX = 90;

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        //существует ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;
    }

    preload() {
        //map
        this.load.image('map', './assets/map/library_room_1.png');

        //helpIcons
        this.load.image('pressX', 'assets/icon/pressX.png');
        this.load.image('closeIcon', 'assets/icon/closeIcon.png');

        //overlayImages
        this.load.image('overlayBackground', 'assets/overlay/overlayBackground.png');
        this.load.image('overlay', 'assets/overlay/overlay.png');

        //ключи
        this.load.image('firstKey', 'assets/keyFrame/firstKey.png');
        this.load.image('secondKey', 'assets/keyFrame/secondKey.png');
        this.load.image('empty', 'assets/keyFrame/Empty.png')


        //specialZone
        this.load.image('specialZone', 'assets/overlay/specialZone.png');

        //characters
        this.load.spritesheet('character1', './assets/characterMap/character1.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('character2', './assets/characterMap/character2.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('character3', './assets/characterMap/character3.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('character4', './assets/characterMap/character4.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('character5', './assets/characterMap/character5.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('character6', './assets/characterMap/character6.png', { frameWidth: 48, frameHeight: 64 });
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

        //Создаём анимации
        this.createAnimations();

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
        this.map = this.add.image(0, 0, 'map').setOrigin(0, 0);
        this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createAnimations() {
        for (let i = 1; i <= 6; i++) {
            this.anims.create({
                key: `walk_down${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: `walk_left${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: `walk_right${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: `walk_up${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    createUnWalkedObjects() {
        const bodyRightDownWall = this.matter.add.fromVertices(1350 + 290, 1722 + 124, '1.5 180 10 327.5 699 326.5 699 156 652.5 156 650.5 145.5 643 142.5 638.5 139 627.5 134 627.5 120.5 634.5 116.5 641 109 651.5 101.5 656.5 92 655.5 84 650.5 77.5 641 71 634.5 67 631.5 63.5 629 60 624 55 616.5 55 615 63.5 606 63.5 608.5 73 596 80.5 591.5 90.5 596 102 619.5 120.5 619.5 134 590 137 585 142.5 579 168 507 168 423.5 164 372 168 110 164 104 178.5 98.5 177 96 172 93 168 91.5 162.5 87.5 150.5 89.5 145 89.5 133 85 124 68 124 57.5 121.5 55.5 100 55.5 89.5 62 89.5 72 84 91.5 70 101.5 51 101.5 43.5 96 36.5 80.5 25.5 62 22.5 59.5 18.5 52.5 12 49 1 43.5 1 42 12 31 13.5 15 13.5 13.5 25.5 1.5 34 5.5 51 18 75.5 40.5 89.5 43.5 118 40.5 121.5 25.5 127 25.5 140 11.5 140 10 149 1.5 166.5', { isStatic: true }, true)
        const bodyLeftDownWall = this.matter.add.fromVertices(1 + 400, 1712 + 130, '702 164 693 326 691.5 336 1 336 1 171 45 171 46 164.5 46 157.5 49 152 67.5 146.5 67.5 133.5 57.5 128 46 120 39.5 110 38.5 99 44 91.5 57.5 87.5 60 80.5 69.5 72.5 91 78 98 85.5 104.5 91.5 106.5 103 102.5 114.5 77 132 78 144.5 83.5 144.5 114.5 149 118.5 174 236 177.5 589.5 173 598.5 190 614 190 621.5 183.5 621.5 173 618 158 625.5 151 621.5 140.5 625.5 135.5 647 135.5 647 101.5 637.5 92.5 625.5 81.5 610.5 66 603.5 41.5 610.5 34 610.5 24.5 618 24.5 625.5 18.5 637.5 5.5 662.5 1 679.5 1 688 11 696.5 41.5 702 54.5 696.5 77 662.5 97.5 662.5 132 679.5 132 693 151', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(944, 915, '106 1810.5 9 1882.5 1 1882.5 1 1 2048.5 1 2048.5 1887 2002.5 1887 1943 1833.5 1934 1781 1887 1766 1859 1733 1859 1650.5 1871 1622 1859 1574 1910 1559 1910 1517.5 1887 1483.5 1887 1438 1934 1425 1934 1388 1934 1369.5 1934 1336.5 1921 1311.5 1921 1257 1903.5 1239.5 1910 1162.5 1941.5 1162.5 1941.5 1128.5 1910 1113 1903.5 1085 1921 1054.5 1952.5 1041.5 1941.5 982.5 1952.5 847.5 1934 837.5 1910 847.5 1846 837.5 1827.5 817 1827.5 786.5 1846 770 1846 449.5 1768.5 449.5 1768.5 407 1576.5 407 1571 449.5 1507 449.5 1507 748 1520 763.5 1525.5 817 1493 847.5 1412 837.5 1306.5 837.5 1206 829 1206 786.5 1233.5 763.5 1216 721 1179 732 1136.5 703.5 1142 682 1110.5 675 1110.5 659 1110.5 473.5 942.5 473.5 942.5 667.5 918.5 682 918.5 703.5 880.5 732 845.5 721 821.5 715.5 814 798.5 684.5 829 642 829 530.5 829 522 816 530.5 786.5 551.5 763.5 551.5 459.5 480.5 459.5 474 421.5 280 421.5 280 459.5 211.5 459.5 211.5 763.5 217 776.5 211.5 829 123 829 136.5 776.5 123 763.5 102.5 853 102.5 936.5 108 955.5 108 980.5 102.5 1004.5 102.5 1044.5 115.5 1052 143 1065.5 150.5 1096 123 1155.5 129.5 1181 150.5 1199.5 143 1249.5 129.5 1258 136.5 1305 115.5 1323.5 115.5 1421.5 163.5 1439 163.5 1475 136.5 1489 106 1592.5', { isStatic: true }, true)
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

        // Создаем область, через которую игрок не может пройти
        const bodyTableTopLeft = this.matter.add.fromVertices(465, 930, '458.5 105.5 24 105.5 1.5 66.5 6 24.5 43.5 0.5 424.5 0.5 483.5 43.5 483.5 77.5', { label: '1', isStatic: true });
        const bodyBookshellRightDown2 = this.matter.add.fromVertices(1536 + 124, 1671 + 90, '244.5 1 0.5 1 0.5 184 244.5 184', { label: '1', isStatic: true })
        const bodyBookshellRightDown1 = this.matter.add.fromVertices(1536 + 118, 1470 + 74, '235 1 1 1 1 148 235 148', { label: '1', isStatic: true })
        const bodyTableMiddleRight = this.matter.add.fromVertices(1285 + 84, 1333 + 160, '12.5 1 1 28.5 1 319 9.5 330.5 162.5 325.5 176 245 169.5 21.5 157 1', { label: '1', isStatic: true })
        const bodyTableTopRight = this.matter.add.fromVertices(1614 + 70, 780 + 45, '136.5 1 1 1 1 85 145 76.2093', { label: '1', isStatic: true })
        const bodyBookshellRightTop = this.matter.add.fromVertices(1509 + 162, 416 + 150, `1 272 1 34 63 28 258 28 332 28 332 272`, { label: `${FIRST_KEY}`, isStatic: true })
        const bodyBookshellLeftTop = this.matter.add.fromVertices(210 + 170, 416 + 165, '1 272 1 34 63 28 258 28 332 28 332 272', { label: '1', isStatic: true })
        const bodyTableMiddleLeft = this.matter.add.fromVertices(154 + 55, 1090 + 98, '95 0.5 17 0.5 0.5 35.5 3.5 188.5 110 188.5 110 42.5', { label: '1', isStatic: true })
        const bodyTableMiddleLeft2 = this.matter.add.fromVertices(625 + 80, 1330 + 165, '1 327 163.5 327 169.5 163.5 160 1 79 1 12 1 1 17.5', { label: '1', isStatic: true })
        const bodyBookshellLeftDown2 = this.matter.add.fromVertices(283 + 116, 1672 + 90, '231 1 1 1 1 171 231 171', { label: '2', isStatic: true })
        const bodyBookshellLeftDown1 = this.matter.add.fromVertices(279 + 116, 1467 + 70, '232 1 1 1 1 152 232 152', { label: `${SECOND_KEY}`, isStatic: true })
        const bodyDoor = this.matter.add.fromVertices(942 + 86, 483 + 90, '167.5 0.5 1 0.5 1 176 167.5 176', {
            label: `${DOOR_ID}`,
            isStatic: true,
        })

        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: [bodyDoor, bodyTableTopLeft, bodyBookshellRightDown2, bodyBookshellRightDown1, bodyTableMiddleRight, bodyTableTopRight, bodyBookshellRightTop, bodyBookshellLeftTop, bodyTableMiddleLeft, bodyTableMiddleLeft2, bodyBookshellLeftDown2, bodyBookshellLeftDown1],
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
            objectB: [bodyDoor, bodyTableTopLeft, bodyBookshellRightDown2, bodyBookshellRightDown1, bodyTableMiddleRight, bodyTableTopRight, bodyBookshellRightTop, bodyBookshellLeftTop, bodyTableMiddleLeft, bodyTableMiddleLeft2, bodyBookshellLeftDown2, bodyBookshellLeftDown1],
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
        this.overlayBackground.setDepth(2);
        this.overlayBackground.setAlpha(0); // Начальное значение прозрачности

        //Первый ключ
        this.firstKey = this.add.image(0, 0, 'firstKey');
        this.firstKey.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.firstKey.setVisible(false);
        this.firstKey.setDepth(2);

        //Второй ключ
        this.secondKey = this.add.image(0, 0, 'secondKey');
        this.secondKey.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.secondKey.setVisible(false);
        this.secondKey.setDepth(2);

        //Текст для пустых
        this.emptySign = this.add.image(0, 0, 'empty');
        this.emptySign.setVisible(false);
        this.emptySign.setDepth(2);

        this.closeButton = this.add.image(0, 0, 'closeIcon');
        this.closeButton.setDisplaySize(this.overlayBackground.displayWidth * 0.05, this.overlayBackground.displayHeight * 0.07);
        this.closeButton.setInteractive();
        this.closeButton.setVisible(false);
        this.closeButton.setDepth(2);
        this.closeButton.setAlpha(0); // Начальное значение прозрачности

        this.closeButton.on('pointerdown', () => {
            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.closeButton, this.overlayBackground, this.emptySign],
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
                    socket.emit('switchScene', CST.SCENE.GAMESCENE2, 1024, 2000);
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.emptySign],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.emptySign],
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
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.enterCodeContainer.setVisible(true);
        } else if (this.eventZone == FIRST_KEY) {
            this.firstKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
        }
        else if (this.eventZone == SECOND_KEY) {
            this.secondKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
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
        else if (this.eventZone == FIRST_KEY) this.firstKey.setVisible(false);
        else if (this.eventZone == SECOND_KEY) this.secondKey.setVisible(false);
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
        socket.emit(`playerMovement:${CST.SCENE.GAMESCENE}`, { x: player.x, y: player.y, velocityX: player.body.velocity.x, velocityY: player.body.velocity.y });
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
const FIRST_KEY = 2222222;
const SECOND_KEY = 3333333;