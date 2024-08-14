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

export class GameScene6 extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.GAMESCENE6 });

        //проверка на то, стоит ли игрок в зоне или нет
        this.isInZone = false;

        //зона в которой стоит игрок
        this.eventZone = null;

        //массив изображений оверлея
        this.overlayImages = [];

        this.mobileFlag = false;

        //существует ли оверлей сейчас поврех экрана
        this.isOverlayVisible = false;
    }

    preload() {
        this.loding = new AnimationControl(AnimationControl.LOADING);
        this.loding.addLoadOnScreen(this, 1280 / 2, 720 / 2, 0.3, 0.3);

        //map
        this.load.image('map6', './assets/map/forest 6.png');

        this.load.image('stonePanelLeft', 'assets/map/stonePanelLeft.png');
        this.load.image('stonePanelRight', 'assets/map/stonePanelRight.png');
        this.load.image('leftMiniGameBack', 'assets/overlay/leftMiniGameBack.png');
        this.load.image('leftMiniGameElm', 'assets/overlay/leftMiniGameElm.png');
        this.load.image('rightMiniGameBack', 'assets/overlay/rightMiniGameBack.png');
        this.load.image('rightMiniGameElm', 'assets/overlay/rightMiniGameElm.png');
        this.load.image('answer', 'assets/keyFrame/answer.png');
        this.load.image('answerLeft', 'assets/keyFrame/answerLeft.png');
        this.load.image('answerRight', 'assets/keyFrame/answerRight.png');

    }

    create(data) {
        this.mySocket = new SocketWorker(socket);

        const { players } = data;

        this.loding.deleteLoadFromScreen(this);

        this.playersController = new PlayersController();

        this.mobileFlag = isMobile();

        // Добавляем карту
        this.createMap('map6', MAP_SETTINGS.MAP_FULL6);

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

        createGameFieldRight(this, 700, 350);
        createGameFieldLeft(this, 700, 350);

        this.createEnterCodeContainer();

        //Подключение слушателей
        this.mySocket.subscribeExistedPlayers(this, this.createOtherPlayersTest);
        this.mySocket.subscribeNewPlayer(this, this.scene.key, otherPlayers, this.playersController.createOtherPlayer);
        this.mySocket.subscribePlayerMoved(this, this.scene.key, this.checkOtherPlayer);
        this.mySocket.subscribePlayerDisconected(this.deletePlayer);
        this.mySocket.subscribeSceneSwitched(this, this.scene.key, sceneSwitched)

        this.mySocket.emitGetPlayers();


        if (!this.textures.exists(MAP_SETTINGS.MAP_FULL6)) {

            this.loadPlusTexture(MAP_SETTINGS.MAP_FULL6, './assets/map/forest 6_full.png');

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

        this.add.image(1306 + 90 / 2, 668 + 90 / 2, 'stonePanelRight');
        this.add.image(674.5 + 45, 666 + 45, 'stonePanelLeft');
    }

    createUnWalkedObjects() {
        const bodyRightWall = this.matter.add.fromVertices(920 + 507.5, 850 + 621.5, '183.5 1142 168.5 1242.5 1014.5 1242.5 1014.5 0.5 532 0.5 545 140 572.5 97.5 618 97.5 708 169.5 752 222.5 774 297.5 730 380.5 679 442.5 649.5 540 649.5 633.5 618 723.5 556 723.5 532 754.5 468 780.5 394.5 842.5 341 883 356 842.5 326.5 815 332 754.5 266 771 223.5 771 211 754.5 183.5 754.5 150.5 780.5 128.5 806 104.5 789.5 86 754.5 60.5 780.5 31 806 12.5 831.5 31 842.5 31 868.5 1.5 879.5 12.5 931 60.5 931 106.5 951 119 980.5 97 1017 150.5 1044.5 119 1083 75 1083 31 1121.5 97 1121.5 183.5 1142', { isStatic: true }, true)
        const bodyLeftWall = this.matter.add.fromVertices(1059, 820, '296.5 1268.5 271 1575 1 1575 1 0.5 1717 0.5 1717 342 1573.5 377 1465.5 415.5 1427 435.5 1399.5 468.5 1304 485 1243.5 468.5 1228.5 435.5 1243.5 402.5 1214 281.5 1214 206 1100 206 1100 252 1117 301.5 1117 377 1017.5 366 990.5 318 990.5 55.5 710 55.5 710 318 672.5 342 590 342 590 206 524 195 445 206 408.5 272 445 355 465.5 529 454.5 668.5 408.5 837.5 296.5 1048.5 296.5 1268.5', { isStatic: true }, true)
    }

    createPlayers(players, cameraMargin) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                //добовляем игрока
                player = this.playersController.createMainPlayer(this, players[id]);

                //настраиваем камеру игрока
                this.cameras.main.startFollow(player);
                if (this.textures.exists(MAP_SETTINGS.MAP_FULL6)) this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.right, this.map.height * MAP_SETTINGS.MAP_SCALE_4_3 + cameraMargin.bottom);
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
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const bodyLeftPanel = this.matter.add.fromVertices(674.5 + 46, 666 + 46, '0.5 1 0.5 91.5 91 91.5 91 1', { label: '2', isStatic: true });
        const bodyRightPanel = this.matter.add.fromVertices(1306 + 46, 668 + 46, '0.5 1 0.5 91.5 91 91.5 91 1', { label: '3', isStatic: true });
        const bodyMainDoor = this.matter.add.fromVertices(904 + 135.5, 394 + 195, '1 63.5806 1 389 270 389 270 63.5806 208.354 1 62.6458 1 1 63.5806', { label: '0', isStatic: true });

        const bodyBackDoor = this.matter.add.fromVertices(471 + 363.5, 1869.5 + 86, '12 0.5 1 171 725.5 171 713 0.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyLeftPanel, bodyRightPanel, bodyMainDoor, bodyBackDoor]

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

        this.answer = this.add.image(0, 0, 'answer');
        this.answer.setDisplaySize(this.cameras.main.width * 0.68, this.cameras.main.height * 0.63);
        this.answer.setVisible(false);
        this.answer.setDepth(3);
        this.answer.setAlpha(0); // Начальное значение прозрачности

        this.answerLeft = this.add.image(0, 0, 'answerLeft');
        this.answerLeft.setDisplaySize(this.cameras.main.width * 0.60, this.cameras.main.height * 0.7);
        this.answerLeft.setVisible(false);
        this.answerLeft.setDepth(3);
        this.answerLeft.setAlpha(0); // Начальное значение прозрачности

        this.answerRight = this.add.image(0, 0, 'answerRight');
        this.answerRight.setDisplaySize(this.cameras.main.width * 0.60, this.cameras.main.height * 0.7);
        this.answerRight.setVisible(false);
        this.answerRight.setDepth(3);
        this.answerRight.setAlpha(0); // Начальное значение прозрачности

        this.closeButton = this.add.image(0, 0, 'closeIcon');
        this.closeButton.setDisplaySize(this.overlayBackground.displayWidth * 0.05, this.overlayBackground.displayHeight * 0.07);
        this.closeButton.setInteractive();
        this.closeButton.setVisible(false);
        this.closeButton.setDepth(2);
        this.closeButton.setAlpha(0); // Начальное значение прозрачности

        this.closeButton.on('pointerdown', () => {

            if (this.eventZone == 2) {
                if (this.answerLeft.visible) {
                    this.answerLeft.setVisible(false);
                    this.overlayBackground.setVisible(false)
                    this.closeButton.setVisible(false);
                } else {
                    hideLeftPuzzle(this);
                }
                this.isOverlayVisible = !this.isOverlayVisible
                return;
            }

            if (this.eventZone == 3) {
                if (this.answerRight.visible) {
                    this.answerRight.setVisible(false);
                    this.overlayBackground.setVisible(false)
                    this.closeButton.setVisible(false);
                } else {
                    hideRightPuzzle(this);
                }
                this.isOverlayVisible = !this.isOverlayVisible
                return;
            }

            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.closeButton, this.overlayBackground, this.answer],
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

                if (this.eventZone == LABEL_ID.DOOR_BACK_ID) {
                    this.moveBackRoom();
                    return;
                }



                if (!this.isOverlayVisible) {

                    if (this.eventZone == 2) {
                        showLeftPuzzle(this);
                        this.isOverlayVisible = !this.isOverlayVisible
                        return;
                    }

                    if (this.eventZone == 3) {
                        showRightPuzzle(this);
                        this.isOverlayVisible = !this.isOverlayVisible
                        return;
                    }

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    if (this.eventZone == 2) {
                        if (this.answerLeft.visible) {
                            this.answerLeft.setVisible(false);
                            this.overlayBackground.setVisible(false)
                            this.closeButton.setVisible(false);
                        } else {
                            hideLeftPuzzle(this);
                        }
                        this.isOverlayVisible = !this.isOverlayVisible
                        return;
                    }

                    if (this.eventZone == 3) {
                        if (this.answerRight.visible) {
                            this.answerRight.setVisible(false);
                            this.overlayBackground.setVisible(false)
                            this.closeButton.setVisible(false);
                        } else {
                            hideRightPuzzle(this);
                        }
                        this.isOverlayVisible = !this.isOverlayVisible
                        return;
                    }

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.answer],
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

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE4, 500, 520);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.enterCodeContainer.setVisible(true);
            return;
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
            if (this.answer.visible) {
                this.answer.setVisible(false);
                this.overlayBackground.setVisible(false);
                this.closeButton.setVisible(false);
            }
            return;
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
            <input id="join-room-connect" class="connect-space-button" type="image" src="./assets/button/enter.png" alt="Connect">
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

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Backspace' && input.value.length === 0 && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (event) => {
                event.preventDefault();
                const pasteData = (event.clipboardData || window.clipboardData).getData('text');
                const pasteArray = pasteData.split('').slice(0, inputs.length);

                pasteArray.forEach((char, i) => {
                    inputs[i].value = char;
                });

                if (pasteArray.length < inputs.length) {
                    inputs[pasteArray.length].focus();
                }
            });
        });

        const correctCode = 'DIOLUM';
        let correctFlag = true;

        const joinRoomConnect = document.getElementById('join-room-connect');
        joinRoomConnect.addEventListener('click', () => {
            if (correctFlag) {
                let code = '';

                inputs.forEach(input => {
                    code += input.value;
                });

                code = code.toUpperCase();

                if (code == correctCode) {
                    this.overlayBackground.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360).setVisible(true);
                    this.answer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 370).setVisible(true);
                    this.answer.setAlpha(1);
                    this.closeButton.setPosition(
                        this.cameras.main.scrollX + 640 + this.overlayBackground.displayWidth / 2 - this.overlayBackground.displayWidth * 0.1 / 2 + 10,
                        this.cameras.main.scrollY + 360 - this.overlayBackground.displayHeight / 2 + this.overlayBackground.displayHeight * 0.1 / 2,
                    ).setVisible(true);

                    this.enterCodeContainer.setVisible(false);
                }
                else {
                    inputs.forEach(input => {
                        input.value = "";
                    });

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
                joinRoomConnect.src = './assets/button/enter.png';
                correctFlag = true
            }
        });

        const joinRoomCancel = document.getElementById('join-room-cancel');
        joinRoomCancel.addEventListener('click', () => {
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
        });

        this.enterCodeContainer.setVisible(false);
    }

    itemInteract(context) {
        if (context.isInZone) {
            player.setVelocity(0);

            if (context.eventZone == LABEL_ID.DOOR_BACK_ID) {
                context.moveBackRoom();
                return;
            }

            if (!context.isOverlayVisible) {

                if (context.eventZone == 2) {
                    showLeftPuzzle(context);
                    context.isOverlayVisible = !context.isOverlayVisible
                    return;
                }

                if (context.eventZone == 3) {
                    showRightPuzzle(context);
                    context.isOverlayVisible = !context.isOverlayVisible
                    return;
                }

                context.showOverlay();

                context.tweens.add({
                    targets: [context.overlayBackground, context.closeButton, context.enterCodeContainer],
                    alpha: 1,
                    duration: 500
                });
            }
            else {

                if (context.eventZone == 2) {
                    if (context.answerLeft.visible) {
                        context.answerLeft.setVisible(false);
                        context.overlayBackground.setVisible(false)
                        context.closeButton.setVisible(false);
                    } else {
                        hideLeftPuzzle(this);
                    }
                    context.isOverlayVisible = !context.isOverlayVisible
                    return;
                }

                if (context.eventZone == 3) {
                    if (context.answerRight.visible) {
                        context.answerRight.setVisible(false);
                        context.overlayBackground.setVisible(false)
                        context.closeButton.setVisible(false);
                    } else {
                        hideLeftPuzzle(this);
                    }
                    context.isOverlayVisible = !context.isOverlayVisible
                    return;
                }

                context.tweens.add({
                    targets: [context.overlayBackground, context.closeButton, context.enterCodeContainer],
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
            if (this.textures.exists(MAP_SETTINGS.MAP_FULL6)) {
                fullMap = true;
                this.map.setScale(4 / 3, 4 / 3);

                this.map.setTexture(MAP_SETTINGS.MAP_FULL6);
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




let itemsRight = [];
let puzzleBackRight;

// Массив, определяющий, какие элементы должны быть повернуты
let rotatedItemsRight = [
    [false, false, true],
    [false, false, true],
    [true, true, true]
];

function createGameFieldRight(scene, startX, startY) {
    const fieldWidth = 720;
    const fieldHeight = 720;
    const cols = 3;
    const rows = 3;
    const padding = 10; // Отступ между элементами
    const itemWidth = (fieldWidth - (cols - 1) * padding) / cols;
    const itemHeight = (fieldHeight - (rows - 1) * padding) / rows;

    puzzleBackRight = scene.add.image(startX, startY, 'rightMiniGameBack');
    puzzleBackRight.setDisplaySize(itemWidth * 3, itemHeight * 3);
    puzzleBackRight.setDepth(2);
    puzzleBackRight.setScrollFactor(0);
    puzzleBackRight.setAlpha(0);
    puzzleBackRight.setVisible(false);

    for (let row = 0; row < rows; row++) {
        itemsRight[row] = [];
        for (let col = 0; col < cols; col++) {
            const x = (startX - 190) + col * 170;
            const y = (startY - 200) + row * 170;

            const item = scene.add.image(x, y, 'rightMiniGameElm');
            item.setDisplaySize(itemWidth / 5 * 3, itemHeight / 5 * 3);
            item.setDepth(2);
            item.setInteractive();
            item.row = row;
            item.col = col;

            // Устанавливаем угол поворота только для определённых элементов
            if (rotatedItemsRight[row][col]) {
                item.setAngle(-90);
            }

            item.on('pointerdown', () => rotateItemsRight(scene, row, col));
            item.setScrollFactor(0);
            item.setVisible(false);
            item.setAlpha(0);
            itemsRight[row][col] = item;
        }
    }
}

function rotateItemsRight(scene, row, col) {
    // Rotate row
    for (let c = 0; c < itemsRight[row].length; c++) {
        scene.tweens.add({
            targets: itemsRight[row][c],
            angle: itemsRight[row][c].angle - 90,
            duration: 300,
            ease: 'Power2'
        });
        rotatedItemsRight[row][c] = !rotatedItemsRight[row][c]; // Меняем значение в массиве
    }

    // Rotate column
    for (let r = 0; r < itemsRight.length; r++) {
        if (r !== row) {
            scene.tweens.add({
                targets: itemsRight[r][col],
                angle: itemsRight[r][col].angle - 90,
                duration: 300,
                ease: 'Power2'
            });
            rotatedItemsRight[r][col] = !rotatedItemsRight[r][col]; // Меняем значение в массиве
        }
    }

    // Проверяем условие победы
    checkWinConditionRight(scene);
}


function checkWinConditionRight(context) {
    for (let row = 0; row < rotatedItemsRight.length; row++) {
        for (let col = 0; col < rotatedItemsRight[row].length; col++) {
            if (rotatedItemsRight[row][col]) {
                return; // Если хотя бы один элемент true, продолжаем игру
            }
        }
    }
    console.log('win');

    hideRightPuzzle(context);

    context.answerRight.setAlpha(1);
    context.overlayBackground.setAlpha(1);
    context.closeButton.setAlpha(1);

    context.answerRight.setPosition(context.cameras.main.scrollX + 640, context.cameras.main.scrollY + 360).setVisible(true);
    context.overlayBackground.setPosition(context.cameras.main.scrollX + 640, context.cameras.main.scrollY + 360).setVisible(true);
    context.closeButton.setPosition(
        context.cameras.main.scrollX + 640 + context.overlayBackground.displayWidth / 2 - context.overlayBackground.displayWidth * 0.1 / 2 + 10,
        context.cameras.main.scrollY + 360 - context.overlayBackground.displayHeight / 2 + context.overlayBackground.displayHeight * 0.1 / 2,
    ).setVisible(true);
}

function showRightPuzzle(context) {
    context.tweens.add({
        targets: [puzzleBackRight],
        alpha: 1,
        duration: 500
    });

    puzzleBackRight.setVisible(true)
    itemsRight.forEach(items => {
        items.forEach(item => {
            context.tweens.add({
                targets: [item],
                alpha: 1,
                duration: 500
            });
            item.setVisible(true);
        })
    })
}

function hideRightPuzzle(context) {
    context.tweens.add({
        targets: [puzzleBackRight],
        alpha: 0,
        duration: 500,
        onComplete: () => {
            try {
                puzzleBackRight.setVisible(false)
            }
            catch (e) { }
        }
    });

    itemsRight.forEach(items => {
        items.forEach(item => {
            context.tweens.add({
                targets: [item],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    try {
                        item.setVisible(false);
                    }
                    catch (e) { }
                }
            });

        })
    })
}

let itemsLeft = [];
let puzzleBackLeft;

// Массив, определяющий, какие элементы должны быть повернуты
let rotatedItemsLeft = [
    [false, false, true],
    [false, false, true],
    [true, true, true]
];

function createGameFieldLeft(scene, startX, startY) {
    const fieldWidth = 720;
    const fieldHeight = 720;
    const cols = 3;
    const rows = 3;
    const padding = 10; // Отступ между элементами
    const itemWidth = (fieldWidth - (cols - 1) * padding) / cols;
    const itemHeight = (fieldHeight - (rows - 1) * padding) / rows;

    puzzleBackLeft = scene.add.image(startX, startY, 'leftMiniGameBack');
    puzzleBackLeft.setDisplaySize(itemWidth * 3, itemHeight * 3);
    puzzleBackLeft.setDepth(2);
    puzzleBackLeft.setScrollFactor(0);
    puzzleBackLeft.setAlpha(0);
    puzzleBackLeft.setVisible(false);

    for (let row = 0; row < rows; row++) {
        itemsLeft[row] = [];
        for (let col = 0; col < cols; col++) {
            const x = (startX - 190) + col * 170;
            const y = (startY - 200) + row * 170;

            const item = scene.add.image(x, y, 'leftMiniGameElm');
            item.setDisplaySize(itemWidth / 5 * 3, itemHeight / 5 * 3);
            item.setDepth(2);
            item.setInteractive();
            item.row = row;
            item.col = col;

            // Устанавливаем угол поворота только для определённых элементов
            if (rotatedItemsLeft[row][col]) {
                item.setAngle(-90);
            }

            item.on('pointerdown', () => rotateItemsLeft(scene, row, col));
            item.setScrollFactor(0);
            item.setVisible(false);
            item.setAlpha(0);
            itemsLeft[row][col] = item;
        }
    }
}

function rotateItemsLeft(scene, row, col) {
    // Rotate row
    for (let c = 0; c < itemsLeft[row].length; c++) {
        scene.tweens.add({
            targets: itemsLeft[row][c],
            angle: itemsLeft[row][c].angle - 90,
            duration: 300,
            ease: 'Power2'
        });
        rotatedItemsLeft[row][c] = !rotatedItemsLeft[row][c]; // Меняем значение в массиве
    }

    // Rotate column
    for (let r = 0; r < itemsLeft.length; r++) {
        if (r !== row) {
            scene.tweens.add({
                targets: itemsLeft[r][col],
                angle: itemsLeft[r][col].angle - 90,
                duration: 300,
                ease: 'Power2'
            });
            rotatedItemsLeft[r][col] = !rotatedItemsLeft[r][col]; // Меняем значение в массиве
        }
    }

    // Проверяем условие победы
    checkWinConditionLeft(scene);
}


function checkWinConditionLeft(context) {
    for (let row = 0; row < rotatedItemsLeft.length; row++) {
        for (let col = 0; col < rotatedItemsLeft[row].length; col++) {
            if (rotatedItemsLeft[row][col]) {
                return; // Если хотя бы один элемент true, продолжаем игру
            }
        }
    }
    console.log('win');
    hideLeftPuzzle(context);

    context.answerLeft.setAlpha(1);
    context.overlayBackground.setAlpha(1);
    context.closeButton.setAlpha(1);

    context.answerLeft.setPosition(context.cameras.main.scrollX + 640, context.cameras.main.scrollY + 360).setVisible(true);
    context.overlayBackground.setPosition(context.cameras.main.scrollX + 640, context.cameras.main.scrollY + 360).setVisible(true);
    context.closeButton.setPosition(
        context.cameras.main.scrollX + 640 + context.overlayBackground.displayWidth / 2 - context.overlayBackground.displayWidth * 0.1 / 2 + 10,
        context.cameras.main.scrollY + 360 - context.overlayBackground.displayHeight / 2 + context.overlayBackground.displayHeight * 0.1 / 2,
    ).setVisible(true);
}

function showLeftPuzzle(context) {
    context.tweens.add({
        targets: [puzzleBackLeft],
        alpha: 1,
        duration: 500
    });

    puzzleBackLeft.setVisible(true)
    itemsLeft.forEach(items => {
        items.forEach(item => {
            context.tweens.add({
                targets: [item],
                alpha: 1,
                duration: 500
            });
            item.setVisible(true);
        })
    })
}

function hideLeftPuzzle(context) {
    context.tweens.add({
        targets: [puzzleBackLeft],
        alpha: 0,
        duration: 500,
        onComplete: () => {
            try {
                puzzleBackLeft.setVisible(false)
            }
            catch (e) { }
        }
    });

    itemsLeft.forEach(items => {
        items.forEach(item => {
            context.tweens.add({
                targets: [item],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    try {
                        item.setVisible(false);
                    }
                    catch (e) { }
                }
            });

        })
    })
}
