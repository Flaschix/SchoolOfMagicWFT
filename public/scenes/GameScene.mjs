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

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        //виден ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;

        this.mobileFlag = false;

        this.isDragging = false;
    }

    preload() {
        // Создание спрайта и запуск анимации
        this.loding = new AnimationControl(AnimationControl.LOADING);
        this.loding.addLoadOnScreen(this, 1280 / 2, 720 / 2, 0.3, 0.3);


        //map
        this.load.image('map', './assets/map/forest 1.png');
    }

    create(data) {
        this.mySocket = new SocketWorker(socket);

        const { players } = data;

        this.loding.deleteLoadFromScreen(this);

        this.playersController = new PlayersController();

        this.mobileFlag = isMobile();

        // Добавляем карту
        this.createMap('map', MAP_SETTINGS.MAP_FULL1);

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
        this.mySocket.subscribeExistedPlayers(this, this.createOtherPlayersTest);
        this.mySocket.subscribeNewPlayer(this, this.scene.key, otherPlayers, this.playersController.createOtherPlayer);
        this.mySocket.subscribePlayerMoved(this, this.scene.key, this.checkOtherPlayer);
        this.mySocket.subscribePlayerDisconected(this.deletePlayer);
        this.mySocket.subscribeSceneSwitched(this, this.scene.key, sceneSwitched)

        this.mySocket.emitGetPlayers();


        if (!this.textures.exists(MAP_SETTINGS.MAP_FULL1)) {

            this.loadPlusTexture(MAP_SETTINGS.MAP_FULL1, './assets/map/forest 1_full.png');

            fullMap = false;
        }
    }

    createJoystick() {

        this.joystickBase = this.add.image(100, this.cameras.main.height - 100, 'joystickBase').setInteractive();
        this.joystickThumb = this.add.image(100, this.cameras.main.height - 100, 'joystickThumb').setInteractive();

        this.joystickBase.setDisplaySize(150, 150);
        this.joystickThumb.setDisplaySize(100, 100);

        this.joystickThumb.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartX = pointer.x;
            this.dragStartY = pointer.y;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                let deltaX = pointer.x - this.dragStartX;
                let deltaY = pointer.y - this.dragStartY;
                let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                let maxDistance = 50;

                if (distance > maxDistance) {
                    let angle = Math.atan2(deltaY, deltaX);
                    deltaX = Math.cos(angle) * maxDistance;
                    deltaY = Math.sin(angle) * maxDistance;
                }

                this.joystickThumb.setPosition(this.joystickBase.x + deltaX, this.joystickBase.y + deltaY);
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
        });

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
        const bodyLeftWall = this.matter.add.fromVertices(812, 40 + 999.5, '629.5 1821.5 765 1945 1220 1998 0.5 1998 0.5 0.5 1984 0.5 1984 231 1834 150 1756.5 150 1618 231 1595 288.5 1618 398 1557.5 513.5 1474 698 1419 825 1315 920 1024 1038 796.5 1107.5 669.5 1107.5 586 882.5 502.5 654.5 424.5 458.5 165 513.5 165 554 254.5 721 292 882.5 375.5 1107.5 375.5 1214 292 1153.5 165 1199.5 110.5 1271.5 145 1320.5 199.5 1320.5 292 1320.5 329.5 1398.5 225.5 1574.5 329.5 1689.5 444.5 1666.5 502.5 1821.5 629.5 1821.5', { isStatic: true }, true);
        const bodyRightWall = this.matter.add.fromVertices(1280 + 442, 630 + 762, '531.5 1451 364 1523 883 1523 883 1 744.5 82 566 335.5 566 451 612 523 597.5 603.5 701.5 649.5 597.5 698.5 566 785 664 828.5 646.5 906.5 494 958 188.5 828.5 188.5 906.5 32.5 958 1 1197.5 133.5 1212 226 1122.5 410 1243.5 517 1243.5 531.5 1341.5 664 1341.5 664 1434 531.5 1451', { isStatic: true }, true)
        const bodyMiddleWall = this.matter.add.fromVertices(615 + 145, 1470 + 149.5, '79 298 1 182.5 79 64.5 165.5 1 289.5 32.5 289.5 214.5 185.5 254.5 79 298', { isStatic: true }, true)
    }

    createPlayers(players, cameraMargin) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                //добовляем игрока
                player = this.playersController.createMainPlayer(this, players[id]);

                //настраиваем камеру игрока
                this.cameras.main.startFollow(player);
                if (this.textures.exists(MAP_SETTINGS.MAP_FULL1)) this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.right, this.map.height * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.bottom);
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
                console.log(players[id]);
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
        highlightGraphics.setDepth(0);


        const bodyDoorRight = this.matter.add.fromVertices(1668 + 187, 187.5 + 187.5, '1 94 21.5 264 234.5 373.5 373 307.5 373 74 185.5 1.5 1 94', {
            label: `${LABEL_ID.DOOR_FORWARD_ID_2}`,
            isStatic: true,
            isSensor: true
        })

        const bodyDoorLeft = this.matter.add.fromVertices(215.5 + 168.5, 490.5 + 131, '93.5 261 1.5 76.5 252 1.5 335.5 206', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyDoorLeft, bodyDoorRight]

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
    }

    createInputHandlers() {
        this.input.keyboard.on('keydown-X', () => {
            if (this.isInZone) {
                player.setVelocity(0);

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                    this.moveForwardRoomLeft();
                    return;
                }

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID_2) {
                    this.moveForwardRoomRight();
                    return;
                }
            }
        });
    }

    moveForwardRoomLeft() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 1424, 1840);
    }

    moveForwardRoomRight() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE3, 1070, 1710);
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
                context.moveForwardRoomLeft();
                return;
            }

            if (context.eventZone == LABEL_ID.DOOR_FORWARD_ID_2) {
                context.moveForwardRoomRight();
                return;
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
            if (this.textures.exists(MAP_SETTINGS.MAP_FULL1)) {
                fullMap = true;

                this.loadedResolutionMap(MAP_SETTINGS.MAP_FULL1, MAP_SETTINGS.MAP_SCALE_4_3, MAP_SETTINGS.MAP_SCALE_4_3)
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
        // this.mySocket.emitPlayerMovement(this.scene.key, movementData);

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

