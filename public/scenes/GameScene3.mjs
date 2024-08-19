import { CST, LABEL_ID } from "../CST.mjs";

import { socket } from "../CST.mjs";
import { SocketWorker } from "../share/SocketWorker.mjs";

import { createUIBottom } from "../share/UICreator.mjs";
import { createUITop } from "../share/UICreator.mjs";
import { createUIRight } from "../share/UICreator.mjs";
import { createUILeftMobile } from "../share/UICreator.mjs";
import { createUI } from "../share/UICreator.mjs";
import { createExitMenu } from "../share/UICreator.mjs";
import { createAvatarDialog } from "../share/UICreator.mjs";
import { isMobile } from "../share/UICreator.mjs";
import { CAMERA_MARGIN, CAMERA_MARGIN_MOBILE } from "../share/UICreator.mjs";

import { createJoystick } from "../share/UICreator.mjs";
import { createMobileXButton } from "../share/UICreator.mjs";

import { HEIGHT_PRESS_X } from "../share/UICreator.mjs";
import { MAP_SETTINGS } from "../share/UICreator.mjs";

import { AnimationControl } from "../share/AnimationControl.mjs";

import { PlayersController } from "../share/PlayerController.mjs";

let player;
let otherPlayers = {};
let fullMap = true;
let moved = false;

export class GameScene3 extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE3 });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        this.mobileFlag = false;

        //существует ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;

        this.foldImgNumber = 0;
        this.fold = [];

    }

    preload() {
        this.loding = new AnimationControl(AnimationControl.LOADING);
        this.loding.addLoadOnScreen(this, 1280 / 2, 720 / 2, 0.3, 0.3);


        //map
        this.load.image('map3', './assets/map/library_room_3.png');
        this.load.image('clueKey', 'assets/keyFrame/clueKey.png');
    }

    create(data) {
        this.mySocket = new SocketWorker(socket);

        const { players } = data;

        this.loding.deleteLoadFromScreen(this);

        this.playersController = new PlayersController();

        this.mobileFlag = isMobile();

        // Добавляем карту
        this.createMap('map3', MAP_SETTINGS.MAP_FULL3);

        //Создаём курсор для обработки инпутов пользователя
        this.cursors = this.input.keyboard.createCursorKeys();

        //Создаём стены и остальные непроходимые объекты
        this.createUnWalkedObjects();

        if (this.mobileFlag) {
            createJoystick(this, 'joystickBase', 'joystickThumb', this.isDragging, 160, this.cameras.main.height - 120);
            createMobileXButton(this, 'touchButton', 'joystickBase', this.cameras.main.width - 150, this.cameras.main.height - 120, this.itemInteract);
            createUILeftMobile(this, 'settingsMobile', 'exitMobile', 'fold', 90, 70, this.cameras.main.width - 90, 70, this.showSettings, this.showExitMenu, 90, 200, this.showFold);
            this.createPlayers(players, CAMERA_MARGIN_MOBILE);
        } else {
            createUI(this, this.showSettings, this.showExitMenu, this.showFold);
            this.createPlayers(players, CAMERA_MARGIN);
        }

        //Создаём объект с которыми будем взаимодействовать
        this.createCollision();

        //Создание оверлея
        this.createOverlays();
        this.createFold();

        //Создание слушателей нажатия кнопок
        this.createInputHandlers();


        //Создаём пользовательский UI для сцен
        createUIRight(this);
        createUITop(this);
        createUIBottom(this);

        createExitMenu(this, this.leaveGame, this.closeExitMenu, this.mobileFlag);
        createAvatarDialog(this, this.enterNewSettingsInAvatarDialog, this.closeAvatarDialog, player.room, isMobile());

        //Подключение слушателей
        this.mySocket.subscribeExistedPlayers(this, this.createOtherPlayersTest);
        this.mySocket.subscribeTakeFold(this, this.updateFold);
        this.mySocket.subscribeNewPlayer(this, this.scene.key, otherPlayers, this.playersController.createOtherPlayer);
        this.mySocket.subscribePlayerMoved(this, this.scene.key, this.checkOtherPlayer);
        this.mySocket.subscribePlayerDisconected(this.deletePlayer);
        this.mySocket.subscribeSceneSwitched(this, this.scene.key, sceneSwitched)

        this.mySocket.emitGetPlayers();
        this.mySocket.emitGetFold();


        if (!this.textures.exists(MAP_SETTINGS.MAP_FULL3)) {

            this.loadPlusTexture(MAP_SETTINGS.MAP_FULL3, './assets/map/library_room_3_full.png');

            fullMap = false;
        }
    }

    createMap(map, mapFull) {
        if (this.textures.exists(mapFull)) {
            this.map = this.add.image(0, 0, mapFull).setOrigin(0, 0);
            this.map.setScale(MAP_SETTINGS.MAP_SCALE_4_3, MAP_SETTINGS.MAP_SCALE_4_3);
            this.matter.world.setBounds(0, 0, this.map.width * MAP_SETTINGS.MAP_SCALE_4_3, this.map.height * MAP_SETTINGS.MAP_SCALE_4_3);
        } else {
            this.map = this.add.image(0, 0, map).setOrigin(0, 0);
            this.map.setScale(2, 2);
            this.matter.world.setBounds(0, 0, this.map.width * MAP_SETTINGS.MAP_SCALE_2, this.map.height * MAP_SETTINGS.MAP_SCALE_2);
        }
    }

    createUnWalkedObjects() {
        const bodyRightDownWall = this.matter.add.fromVertices(1441 + 80, 1865 + 64, '25.5 104.5 25.5 181 378.5 181 326 104.5 261.5 62.5 114 26 25.5 14 9.5 1.5 1 20.5 9.5 48.5 9.5 83.5', { isStatic: true }, true)
        const bodyLeftDownWall = this.matter.add.fromVertices(1 + 290, 1679 + 170, '550 290.5 557.5 368.5 5 368.5 0.5 153.5 123 153.5 132.5 153.5 173.5 153.5 217 137 233 111 229 83 229 64.5 237 58.5 237 34.5 243 1 251.5 1 251.5 17 259 46.5 263.5 64.5 268.5 114 259 114 259 145.5 251.5 182.5 276 189 280 198 268.5 198 268.5 244 299 260 365 231.5 514 203.5 577.5 191.5 569.5 244 569.5 273', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(944 + 197, 915 + 242, '1753.5 1871 1771 1866 1771 1866 1788.5 1861 1840 1871 1804.5 1856 1782 1829 1782 1788 1782 1769.5 1782 1747 1788.5 1747 1788.5 1718.5 1799 1679.5 1804.5 1679.5 1804.5 1690 1814 1747 1814 1779 1820 1806 1840 1821 1922.5 1829 1928 1685.5 1928 1641 1877.5 1647.5 1850 1641 1814 1626.5 1774.5 1587 1774.5 1577.5 1782 1570 1782 1457.5 1782 1411.5 1782 1393 1782 1373.5 1786.5 1347 1793 1308 1803 1308 1814 1341 1820.5 1360 1814 1393 1814 1411.5 1850 1430.5 1896 1426 1928 1401.5 1928 1360 1935 1270 1935 1028 1817 958 1817 907 1694.5 794.5 1674.5 757 1597 762.5 1592.5 816 1550.5 855.5 1550.5 926 1526.5 952 1513 999 1485.5 1023 1460 999 1460 668 1212.5 668 1190 757 1194.5 995 1168.5 1023 1161 1073.5 1149 1102 1105.5 1102 1096.5 761 1140.5 736 1128.5 561.5 1134 492 1045 384.5 975 384.5 894.5 476.5 894.5 726.5 920.5 749.5 925 1108 874 1108 859.5 1066 831.5 1011 825 761 558.5 756.5 564.5 1005 527 1035.5 466 965.5 475 879.5 458.5 846 376.5 797.5 358.5 802.5 231.5 905.5 231.5 984.5 210 1000.5 152.5 1043 144 1079 115 1104 120 1397.5 130.5 1411 158.5 1431 204.5 1431 225.5 1411 225.5 1397.5 225.5 1379.5 225.5 1359.5 231.5 1347 231.5 1331 231.5 1314 239.5 1303.5 250 1314 250 1331 255.5 1347 263.5 1379.5 263.5 1562.5 276.5 1582.5 225.5 1623 177 1633.5 120 1623 124.5 1827.5 0.5 1827.5 0.5 0.5 2048 0.5 2048 2046 1820.5 2046 1799 2019.5 1774.5 1978.5 1774.5 1935 1774.5 1900.5', { isStatic: true }, true)
    }

    createPlayers(players, cameraMargin) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                //добовляем игрока
                player = this.playersController.createMainPlayer(this, players[id]);

                //настраиваем камеру игрока
                this.cameras.main.startFollow(player);
                if (this.textures.exists(MAP_SETTINGS.MAP_FULL3)) this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.right, this.map.height * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.bottom);
                else this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width * MAP_SETTINGS.MAP_SCALE_2 + cameraMargin.right, this.map.height * MAP_SETTINGS.MAP_SCALE_2 + cameraMargin.bottom);
            } else {
                this.playersController.createOtherPlayer(this, players[id], otherPlayers);
            }
        });
    }

    createOtherPlayersTest(context, players) {
        Object.keys(players).forEach((id) => {
            if (!(id === socket.id) && otherPlayers[id] == null) {
                context.playersController.createOtherPlayer(context, players[id], otherPlayers);
            }
        });
    }

    checkOtherPlayer(self, playerInfo) {
        if (otherPlayers[playerInfo.id]) {
            const player = otherPlayers[playerInfo.id];

            // Обновляем целевые координаты и скорость
            player.targetX = playerInfo.x;
            player.targetY = playerInfo.y;
            player.velocityX = playerInfo.velocityX;
            player.velocityY = playerInfo.velocityY;
            player.isMoving = playerInfo.isMoving;
            player.direction = playerInfo.direction;

            // Интерполяция движения
            self.tweens.add({
                targets: player,
                x: playerInfo.x,
                y: playerInfo.y,
                duration: 200,
                onUpdate: function () {
                    // Обновление анимации на основе данных о движении
                    self.playersController.updateAnimOtherPlayer(player, {
                        ...playerInfo,
                        velocityX: player.targetX - player.x,
                        velocityY: player.targetY - player.y
                    });
                },
                onComplete: function () {
                    // Проверяем, нужно ли остановить анимацию
                    try {
                        if (!player.isMoving) {
                            player.anims.stop();
                        }
                    } catch (e) { };
                }
            });
        }
    }

    deletePlayer(id) {
        if (otherPlayers[id]) {
            otherPlayers[id].nameText.destroy();
            otherPlayers[id].destroy();
            delete otherPlayers[id];
        }
    }

    createCollision() {

        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const bodyDoor = this.matter.add.fromVertices(892 + 120, 500 + 90, '0.5 91 0.5 328.5 168.5 328.5 168.5 78.5 139 28.5 84 1.5 27.5 33.5', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
        });
        const bodyRightBottomTable = this.matter.add.fromVertices(1352 + 90, 1628 + 44, '92 144.5 34.5 133 1 99 1 71.5 11 38 34.5 10 72 1 125.5 10 164 51.5 149.5 118.5', { label: '1', isStatic: true });
        const bodyRightMiddleTable = this.matter.add.fromVertices(1286 + 160, 1189 + 112, '180 1.5 1.5 165.5 124.5 258.5 303 87.5', { label: '1', isStatic: true });

        const bodyRightMiddleShell = this.matter.add.fromVertices(1760 + 98, 990 + 220, '1 260 126.5 339 148.5 282 148.5 64 66 1.5 1 58.5', { label: `${LABEL_ID.FIVETH_KEY}`, isStatic: true });
        const bodyRightTopShell = this.matter.add.fromVertices(1539 + 146, 760 + 170, '1.5 83.5 11 170 169 302 259.5 226.5 259.5 126.5 89.5 1', { label: '1', isStatic: true });
        const bodyRightTopBookshell = this.matter.add.fromVertices(1200 + 125, 680 + 154, '254 1 254 327 1 327 1 98.8 18.5154 1', { label: '1', isStatic: true });
        const bodyLeftTopBookshell = this.matter.add.fromVertices(560 + 135, 770 + 122, '270.5 235.5 6 235.5 1 1 263.5 4.5', { label: '1', isStatic: true });
        const bodyLeftMiddleTable = this.matter.add.fromVertices(540 + 110, 1050 + 100, '97 26.5 1 132.5 1 207.5 48 221.5 107.5 207.5 220 103 205 26.5 153 1.5', { label: '1', isStatic: true });
        const bodyLeftTopShell = this.matter.add.fromVertices(249 + 100, 811 + 130, '223.5 178 100 279.5 88 279.5 1 199 1 112 130 1 211 49.5 234.5 89.5', { label: '1', isStatic: true });
        const bodyLeftMiddleShell = this.matter.add.fromVertices(125 + 65, 1020 + 195, '147.5 245 7 339.5 0.5 70 106.5 1.5 147.5 46.5', { label: '1', isStatic: true });
        const bodyLeftBottomTable = this.matter.add.fromVertices(450 + 80, 1622 + 52, '164.5 63.5 144 128.5 107.5 151 62 153.5 25.5 144 0.5 99 0.5 63.5 31.5 22.5 93.5 1 140 22.5', { label: `${LABEL_ID.CLUE_KEY}`, isStatic: true });

        const bodyDoorBack = this.matter.add.fromVertices(942 + 80, 1900 + 74, '8 130.5 1 190.5 544.5 190.5 508.5 142.5 422.5 62.5 309 0.5 217 0.5 115.5 56.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyDoorBack, bodyDoor, bodyLeftBottomTable, bodyLeftMiddleShell, bodyLeftTopShell, bodyLeftMiddleTable, bodyLeftTopBookshell, bodyRightBottomTable, bodyRightMiddleTable, bodyRightMiddleShell, bodyRightTopShell, bodyRightTopBookshell];

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
        this.overlayBackground.setDepth(2);
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
        this.closeButton.setDepth(2);
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

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                    this.moveForwardRoom();
                    return;
                }
                if (this.eventZone == LABEL_ID.DOOR_BACK_ID) {
                    this.moveBackRoom();
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.clueKey, this.fiverthKey],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.clueKey, this.fiverthKey],
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
    }

    moveForwardRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE4, 1024, 1850);
    }

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 1024, 850);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == LABEL_ID.FIVETH_KEY) {
            this.fiverthKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
            if (this.fold.indexOf(this.fiverthKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.fiverthKey.texture.key);
            }
        }
        else if (this.eventZone == LABEL_ID.CLUE_KEY) {
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
        if (this.eventZone == LABEL_ID.FIVETH_KEY) this.fiverthKey.setVisible(false);
        else if (this.eventZone == LABEL_ID.CLUE_KEY) this.clueKey.setVisible(false);
        else {
            this.emptySign.setVisible(false);
        }
        this.overlayBackground.setVisible(false);
        this.closeButton.setVisible(false);
    }

    createFold() {
        this.foldKeys = this.add.image(this.cameras.main.width - 636, this.cameras.main.height / 2, 'firstKey');
        this.foldKeys = this.add.image(this.cameras.main.width - 636, this.cameras.main.height / 2 + 30, 'firstKey');
        this.foldKeys.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.foldKeys.setDepth(2);
        this.foldKeys.setScrollFactor(0);
        this.foldKeys.setVisible(false);
        this.foldKeys.setAlpha(1);


        this.leftArrow = this.add.image(0, 0, 'leftArrow');
        this.rightArrow = this.add.image(0, 0, 'rightArrow');

        this.rightArrow.setPosition(
            this.cameras.main.width - 250,
            this.cameras.main.height / 2 - 10,
        )
        this.rightArrow.setScrollFactor(0);
        this.rightArrow.setDepth(2);

        this.leftArrow.setPosition(
            250,
            this.cameras.main.height / 2 - 10,
        )
        this.leftArrow.setScrollFactor(0);
        this.leftArrow.setDepth(2);

        this.leftArrow.setInteractive();
        this.rightArrow.setInteractive();
        this.leftArrow.setVisible(false);
        this.rightArrow.setVisible(false);

        this.rightArrow.on('pointerdown', () => {
            this.moveRightKeys();
        });

        this.leftArrow.on('pointerdown', () => {
            this.moveLeftKeys();
        });

        this.foldColseBtn = this.add.image(0, 0, 'closeIcon');
        this.foldColseBtn.setDisplaySize(this.overlayBackground.displayWidth * 0.05, this.overlayBackground.displayHeight * 0.07);
        this.foldColseBtn.setInteractive();
        this.foldColseBtn.setVisible(false);
        this.foldColseBtn.setDepth(2);
        this.foldColseBtn.setAlpha(0); // Начальное значение прозрачности

        this.foldColseBtn.on('pointerdown', () => {
            this.isOverlayVisible = false;

            this.foldKeys.setVisible(false);
            this.foldColseBtn.setVisible(false);
            this.overlayBackground.setVisible(false);
            this.emptySign.setVisible(false);
            this.leftArrow.setVisible(false);
            this.rightArrow.setVisible(false);
        });
    }

    showFold(context) {
        if (context.isOverlayVisible) return;
        context.isOverlayVisible = true
        context.overlayBackground.setAlpha(1);
        context.foldColseBtn.setAlpha(1);


        if (context.fold == null || context.fold.length < 1) {
            context.emptySign.setPosition(context.cameras.main.scrollX + 640, context.cameras.main.scrollY + 360).setVisible(true);;
            context.emptySign.setAlpha(1);
        } else {
            context.foldImgNumber = 0;
            context.foldKeys.setTexture(context.fold[0]);
            context.foldKeys.setVisible(true);
            context.leftArrow.setVisible(true);
            context.rightArrow.setVisible(true);
        }


        context.overlayBackground.setPosition(context.cameras.main.scrollX + 640, context.cameras.main.scrollY + 360).setVisible(true);
        context.foldColseBtn.setPosition(
            context.cameras.main.scrollX + 640 + context.overlayBackground.displayWidth / 2 - context.overlayBackground.displayWidth * 0.1 / 2 + 10,
            context.cameras.main.scrollY + 360 - context.overlayBackground.displayHeight / 2 + context.overlayBackground.displayHeight * 0.1 / 2,
        ).setVisible(true);
    }

    moveRightKeys() {
        if (this.foldImgNumber < this.fold.length - 1) {
            this.foldImgNumber += 1;

            this.tweens.add({
                targets: [this.foldKeys],
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    try {
                        this.foldKeys.setTexture(this.fold[this.foldImgNumber]);
                        this.tweens.add({
                            targets: [this.foldKeys],
                            alpha: 1,
                            duration: 250,
                        });
                    }
                    catch (e) { }
                }
            });
        }
    }

    moveLeftKeys() {
        if (this.foldImgNumber > 0) {
            this.foldImgNumber -= 1;

            this.tweens.add({
                targets: [this.foldKeys],
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    try {
                        this.foldKeys.setTexture(this.fold[this.foldImgNumber]);
                        this.tweens.add({
                            targets: [this.foldKeys],
                            alpha: 1,
                            duration: 250,
                        });
                    }
                    catch (e) { }
                }
            });
        }
    }

    updateFold(context, arr) {
        context.fold = arr
    }

    showSettings(self) {
        self.avatarDialog.setPosition(self.cameras.main.scrollX + 640, self.cameras.main.scrollY + 360);
        self.avatarDialog.setVisible(true);
        self.isOverlayVisible = true
        self.exitContainer.setVisible(false);
        player.setVelocity(0);
    }

    showExitMenu(self) {
        self.exitContainer.setPosition(self.cameras.main.scrollX + 640, self.cameras.main.scrollY + 360);
        self.exitContainer.setVisible(true);
        self.isOverlayVisible = true
        self.avatarDialog.setVisible(false);
        player.setVelocity(0);
    }

    leaveGame(self) {
        window.location.reload();
    }

    closeExitMenu(self) {
        self.exitContainer.setVisible(false);
        self.isOverlayVisible = false
    }

    enterNewSettingsInAvatarDialog(self, usernameInput, nameError, imgCount) {
        const username = usernameInput.value;
        if (username.length < 1 || username.length > 12) {
            nameError.style.visibility = "visible";
        } else {
            self.mySocket.emitPlayerReconnect({ x: player.x, y: player.y, avatar: imgCount + 1, name: username });
            player.setTexture(`character${imgCount + 1}`);
            player.character = imgCount + 1;
            player.nameText.setText(username);
            self.avatarDialog.setVisible(false);
            self.isOverlayVisible = false;
            nameError.style.visibility = "hidden";
        }
    }

    closeAvatarDialog(self) {
        self.avatarDialog.setVisible(false);
        self.isOverlayVisible = false;
    }

    loadPlusTexture(name, path) {
        this.load.image(name, path);

        // Начало загрузки
        this.load.start();
    }

    loadedResolutionMap(name, scaleX, scaleY) {
        this.map.setScale(scaleX, scaleY);

        this.map.setTexture(name);
        this.matter.world.setBounds(0, 0, this.map.width * scaleX, this.map.height * scaleY);
    }

    itemInteract(context) {
        if (context.isInZone) {
            player.setVelocity(0);

            if (context.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                context.moveForwardRoom();
                return;
            }

            if (context.eventZone == LABEL_ID.DOOR_BACK_ID) {
                context.moveBackRoom();
                return;
            }

            if (!context.isOverlayVisible) {

                context.showOverlay();

                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.clueKey, context.fiverthKey],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.clueKey, context.fiverthKey],
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        try {
                            context.hideOverlay();
                        } catch (e) { }

                    }
                });
            }
        }
    }

    update() {
        if (!player || this.isOverlayVisible) return;

        this.updatePlayerPosition();

        this.updatePressXVisibility();

        // Интерполяция для других игроков
        Object.keys(otherPlayers).forEach((id) => {
            let otherPlayer = otherPlayers[id];
            if (otherPlayer.targetX !== undefined && otherPlayer.targetY !== undefined) {
                otherPlayer.x += (otherPlayer.targetX - otherPlayer.x) * 0.1;
                otherPlayer.y += (otherPlayer.targetY - otherPlayer.y) * 0.1;
            }
        });


        if (!fullMap) {
            if (this.textures.exists(MAP_SETTINGS.MAP_FULL3)) {
                fullMap = true;
                this.map.setScale(4 / 3, 4 / 3);

                this.map.setTexture(MAP_SETTINGS.MAP_FULL3);
                this.matter.world.setBounds(0, 0, this.map.width * 4 / 3, this.map.height * 4 / 3);
            }
        }
    }
    updatePlayerPosition() {

        if (!this.mobileFlag) this.playersController.updateMainPlayerPosition(player, this.cursors);
        else {
            this.playersController.updateMainPlayerPositionJoystick(player, this.joystickThumb, this.joystickBase);
        }

        const isMoving = player.body.velocity.x !== 0 || player.body.velocity.y !== 0;
        const movementData = {
            x: player.x,
            y: player.y,
            velocityX: player.body.velocity.x,
            velocityY: player.body.velocity.y,
            isMoving: isMoving,
            direction: player.direction
        };

        if (player.body.velocity.x != 0 || player.body.velocity.y != 0) {
            this.mySocket.emitPlayerMovement(this.scene.key, movementData);
            moved = true;
        } else if (moved) {
            this.mySocket.emitPlayerMovement(this.scene.key, movementData);
            moved = false;
        }
    }

    updatePressXVisibility() {
        if (this.isInZone) {
            if (this.mobileFlag) {
                this.mobileXButton.setVisible(true);
                this.buttonBackground.setVisible(true);
            }
            else {
                this.pressX.setPosition(player.x, player.y - HEIGHT_PRESS_X);
                this.pressX.setVisible(true);
            }
        } else {
            if (this.mobileFlag) {
                this.mobileXButton.setVisible(false);
                this.buttonBackground.setVisible(false);
            }
            else {
                this.pressX.setVisible(false);
            }
        }
    }

}

function sceneSwitched(self, data) {
    self.map.destroy();
    self.avatarDialog.destroy();
    self.exitContainer.destroy();
    otherPlayers = {};
    let players = data.players;
    self.scene.start(data.scene, { players });
}

