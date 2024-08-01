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

export class GameScene2 extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE2 });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        this.mobileFlag = false;

        //существует ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;
    }

    preload() {
        this.loding = new AnimationControl(AnimationControl.LOADING);
        this.loding.addLoadOnScreen(this, 1280 / 2, 720 / 2, 0.3, 0.3);

        //map
        this.load.image('map2', './assets/map/laboratory_room_2.png');
        this.load.image('thirdKey', 'assets/keyFrame/thirdKey.png');
        this.load.image('fourthKey', 'assets/keyFrame/fourthKey.png');

        this.load.image('doorRoom1', './assets/map/door_room_4.png');
        this.load.image('stair', './assets/map/stair.png');
        this.load.image('balcon', './assets/map/balcon.png');
    }

    create(data) {
        this.mySocket = new SocketWorker(socket);

        const { players } = data;

        this.loding.deleteLoadFromScreen(this);

        this.playersController = new PlayersController();

        this.mobileFlag = isMobile();

        // Добавляем карту
        this.createMap('map2', MAP_SETTINGS.MAP_FULL2);

        //Создаём курсор для обработки инпутов пользователя
        this.cursors = this.input.keyboard.createCursorKeys();

        //Создаём стены и остальные непроходимые объекты
        this.createUnWalkedObjects();

        if (this.mobileFlag) {
            createJoystick(this, 'joystickBase', 'joystickThumb', this.isDragging, 160, this.cameras.main.height - 120);
            createMobileXButton(this, 'touchButton', 'joystickBase', this.cameras.main.width - 150, this.cameras.main.height - 120, this.itemInteract);
            createUILeftMobile(this, 'settingsMobile', 'exitMobile', 90, 70, this.cameras.main.width - 90, 70, this.showSettings, this.showExitMenu);
            this.createPlayers(players, CAMERA_MARGIN_MOBILE);
        } else {
            createUI(this, this.showSettings, this.showExitMenu);
            this.createPlayers(players, CAMERA_MARGIN);
        }

        //Создаём объект с которыми будем взаимодействовать
        this.createCollision();

        //Создание оверлея
        this.createOverlays();

        //Создание слушателей нажатия кнопок
        this.createInputHandlers();


        //Создаём пользовательский UI для сцен
        createUIRight(this);
        createUITop(this);
        createUIBottom(this);

        createExitMenu(this, this.leaveGame, this.closeExitMenu, this.mobileFlag);
        createAvatarDialog(this, this.enterNewSettingsInAvatarDialog, this.closeAvatarDialog, player.room, isMobile());

        //Подключение слушателей
        this.mySocket.subscribeNewPlayer(this, this.scene.key, otherPlayers, this.playersController.createOtherPlayer);
        this.mySocket.subscribePlayerMoved(this, this.scene.key, this.checkOtherPlayer);
        this.mySocket.subscribePlayerDisconected(this.deletePlayer);
        this.mySocket.subscribeSceneSwitched(this, this.scene.key, sceneSwitched)


        if (!this.textures.exists(MAP_SETTINGS.MAP_FULL2)) {

            this.loadPlusTexture(MAP_SETTINGS.MAP_FULL2, './assets/map/laboratory_room_2_full.png');

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

        this.add.image(964, 1960, 'doorRoom1');
        this.add.image(1028, 624, 'balcon').setDepth(2);
        this.add.image(1505, 1090, 'stair');
    }

    createUnWalkedObjects() {
        const bodyMainWall = this.matter.add.fromVertices(280 + 1024, 110 + 1027, '1235.5 1891 1235.5 2037.5 1235.5 2044 2047.5 2044 2047.5 0.5 0.5 0.5 0.5 2053 71 2053 62 1284.5 691.5 1284.5 691.5 853 625.5 853 54.5 853 47.5 798 41 671.5 41 449.5 57.5 303 129.5 159.5 233.5 77.5 389 64.5 538 149.5 631 286 637 401.5 707.5 391.5 846.5 286 1230.5 286 1331.5 401.5 1385 401.5 1397.5 305 1459 189.5 1552 103.5 1662 62 1754 53 1951 219 1962 796 1636 796 1636 896.5 1991.5 896.5 1985.5 1342 2017 1499.5 2006 1548 1999 1566 1985.5 1591.5 1974.5 1608 1957 1624 1938 1634.5 1801 1632.5 1790.5 1624 1779.5 1620 1768.5 1621.5 1768.5 1629.5 1758 1629.5 1733 1613 1707 1617.5 1671.5 1617.5 1661.5 1638.5 1649.5 1646 1649.5 1669.5 1631 1697 1615 1723 1598.5 1742 1573.5 1768 1537 1777 1531.5 1757 1402 1757 1407.5 1829.5 1407.5 1971.5 1344.5 1971.5 1344.5 1963 1337 1933.5 1337 1874 1318.5 1859.5 1309.5 1839 1280.5 1845.5 1252.5 1853 1235.5 1891', { isStatic: true }, true)
        const bodyDownDoorWall = this.matter.add.fromVertices(710 + 361.5, 730 + 288.5, '11.5 476.5 215 400 215 229 239.5 177.5 283 153 348 153 410 184.5 427.5 229 427.5 400 583.5 454.5 685.5 472 693 576 722 576 712 1 1 7.5 11.5 476.5', { isStatic: true }, true);
        const bodyUpDoorWall = this.matter.add.fromVertices(620 + 370, 256 + 175.5, '12 343 272.5 343 266 206.5 272.5 161.5 301.5 106.5 356.5 92 439 92 481 142.5 489.5 350.5 739 350.5 739 142.5 587.5 1 242 1 178 28.5 1 142.5 12 343', { isStatic: true }, true)
        const bodyWallStairRight = this.matter.add.fromVertices(1587 + 19.5, 790 + 306, '38 611 1 611 1 1 38 1 38 611', { isStatic: true }, true)
    }
    createPlayers(players, cameraMargin) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                //добовляем игрока
                player = this.playersController.createMainPlayer(this, players[id]);

                //настраиваем камеру игрока
                this.cameras.main.startFollow(player);
                if (this.textures.exists(MAP_SETTINGS.MAP_FULL2)) this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.right, this.map.height * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.bottom);
                else this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width * MAP_SETTINGS.MAP_SCALE_2 + cameraMargin.right, this.map.height * MAP_SETTINGS.MAP_SCALE_2 + cameraMargin.bottom);
            } else {
                this.playersController.createOtherPlayer(this, players[id], otherPlayers);
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
                    if (!player.isMoving) {
                        player.anims.stop();
                    }
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
        const bodyDoorDown = this.matter.add.fromVertices(920 + 100, 1000 + 118.5, '0.5 69 0.5 236 199 236 199 69 168.5 18.5 98.5 1.5 29 18.5 0.5 69', { label: `${LABEL_ID.DOOR_FORWARD2_ID}`, isStatic: true })
        const bodyDoorUp = this.matter.add.fromVertices(920 + 100, 414 + 118.5, '0.5 69 0.5 236 199 236 199 69 168.5 18.5 98.5 1.5 29 18.5 0.5 69', { label: `${LABEL_ID.DOOR_FORWARD_ID}`, isStatic: true })


        const bodyMiddleBookshell = this.matter.add.fromVertices(834.5 + 174, 1376.5 + 157, '0.5 149.5 25 313.5 347.5 313.5 347.5 0.5 54 0.5 9.5 53.5', { label: '1', isStatic: true });
        const bodyLeftMiddleTable = this.matter.add.fromVertices(63 + 97.5, 1385.5 + 195, '180.5 389 1 389 1 0.5 193.5 0.5 180.5 389', { label: '1', isStatic: true })
        const bodyLeftMiddleTable2 = this.matter.add.fromVertices(66 + 313, 1288 + 50, '1 1 1 99 625 99 625 1 1 1', { label: `${LABEL_ID.THIRD_KEY}`, isStatic: true })

        const bodyLeftTopTable = this.matter.add.fromVertices(67 + 216, 601 + 88.5, '1 11.5 1 176 422 176 431 1 1 11.5', { label: '1', isStatic: true })
        const bodyLeftTopookshell = this.matter.add.fromVertices(53 + 296, 68 + 279.5, '0.5 558 590.5 558 569.5 234 467.5 67 296 1.5 114.5 67 0.5 234 0.5 558', { label: '1', isStatic: true })
        const bodyRightTopBookshell = this.matter.add.fromVertices(1387 + 280, 78 + 292.5, '559 506 1 584 1 246.5 123.5 73.5 301 1 443 23.5 559 138 559 506', { label: `${LABEL_ID.FOURTH_KEY}`, isStatic: true })

        const bodyCotel = this.matter.add.fromVertices(328 + 91.5, 1717 + 78.5, '15.5 156.5 1 144 1 40 26 35 51 26.5 68 1.5 74 13.5 82 13.5 92.5 35 176 35 182 112.5 170 156.5 15.5 156.5', { label: '1', isStatic: true })
        const bodyRightMiddleBookshel = this.matter.add.fromVertices(1634.5 + 173, 912 + 211, '345.5 421 2.5 421 0.5 0.5 345.5 0.5', { label: '1', isStatic: true })

        const bodyDoorBack = this.matter.add.fromVertices(954, 1980, '8 130.5 1 190.5 544.5 190.5 508.5 142.5 422.5 62.5 309 0.5 217 0.5 115.5 56.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const arrBodies = [bodyLeftTopTable, bodyLeftMiddleTable2, bodyRightMiddleBookshel, bodyDoorBack, bodyDoorDown, bodyDoorUp, bodyMiddleBookshell, bodyLeftMiddleTable, bodyLeftTopookshell, bodyRightTopBookshell, bodyCotel];

        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: arrBodies,
            callback: function (eventData) {
                highlightGraphics.clear();
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

        //Первый ключ
        this.thirdKey = this.add.image(0, 0, 'thirdKey');
        this.thirdKey.setDisplaySize(this.cameras.main.width * 0.72, this.cameras.main.height * 0.7);
        this.thirdKey.setVisible(false);
        this.thirdKey.setDepth(2);

        //Второй ключ
        this.fourthKey = this.add.image(0, 0, 'fourthKey');
        this.fourthKey.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.7);
        this.fourthKey.setVisible(false);
        this.fourthKey.setDepth(2);

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
                targets: [this.closeButton, this.overlayBackground, this.emptySign, this.thirdKey, this.fourthKey],
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

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                    this.moveForwardRoom();
                    return;
                }

                if (this.eventZone == LABEL_ID.DOOR_FORWARD2_ID) {
                    this.moveForwardRoom2();
                    return;
                }

                if (this.eventZone == LABEL_ID.DOOR_BACK_ID) {
                    this.moveBackRoom();
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.thirdKey, this.fourthKey],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.thirdKey, this.fourthKey],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE3, 1024, 1840);
    }

    moveForwardRoom2() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE4, 650, 1890);
    }

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE, 1024, 700);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == LABEL_ID.THIRD_KEY) {
            this.thirdKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
        }
        else if (this.eventZone == LABEL_ID.FOURTH_KEY) {
            this.fourthKey.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
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
        if (this.eventZone == LABEL_ID.THIRD_KEY) this.thirdKey.setVisible(false);
        else if (this.eventZone == LABEL_ID.FOURTH_KEY) this.fourthKey.setVisible(false);
        else {
            this.emptySign.setVisible(false);
        }
        this.overlayBackground.setVisible(false);
        this.closeButton.setVisible(false);
    }

    showSettings(self) {
        self.avatarDialog.setPosition(self.cameras.main.scrollX + 640, self.cameras.main.scrollY + 360);
        self.avatarDialog.setVisible(true);
        self.isOverlayVisible = true
        player.setVelocity(0);
    }

    showExitMenu(self) {
        self.exitContainer.setPosition(self.cameras.main.scrollX + 640, self.cameras.main.scrollY + 360);
        self.exitContainer.setVisible(true);
        self.isOverlayVisible = true
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

            if (context.eventZone == LABEL_ID.DOOR_FORWARD2_ID) {
                context.moveForwardRoom2();
                return;
            }

            if (context.eventZone == LABEL_ID.DOOR_BACK_ID) {
                context.moveForwardRoom2();
                return;
            }

            if (!context.isOverlayVisible) {

                context.showOverlay();

                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.thirdKey, context.fourthKey],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.thirdKey, context.fourthKey],
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        try {
                            context.hideOverlay();
                            console.log('dddd');
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
            if (this.textures.exists(MAP_SETTINGS.MAP_FULL2)) {
                fullMap = true;
                this.map.setScale(4 / 3, 4 / 3);

                this.map.setTexture(MAP_SETTINGS.MAP_FULL2);
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

