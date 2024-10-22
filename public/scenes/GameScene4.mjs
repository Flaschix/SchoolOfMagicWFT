import { CST, LABEL_ID, myMap } from "../CST.mjs";

import { socket } from "../CST.mjs";

import { cd, createUILeftMobile, decrypt, decryptN } from "../share/UICreator.mjs";
import { createUI } from "../share/UICreator.mjs";
import { createAvatarDialog } from "../share/UICreator.mjs";
import { isMobile } from "../share/UICreator.mjs";
import { CAMERA_MARGIN, CAMERA_MARGIN_MOBILE } from "../share/UICreator.mjs";

import { createJoystick } from "../share/UICreator.mjs";
import { createMobileXButton } from "../share/UICreator.mjs";

import { BaseScene } from "./BaseScene.mjs";

export class GameScene4 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE4);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map4', './assets/map/laboratory_room_3.jpg');
        this.load.image('answer', 'assets/keyFrame/answer.png');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map4');

        if (this.mobileFlag) {
            createJoystick(this, 'joystickBase', 'joystickThumb', this.isDragging, 160, this.cameras.main.height - 140);
            createMobileXButton(this, 'touchButton', 'joystickBase', this.cameras.main.width - 150, this.cameras.main.height - 140, this.itemInteract);
            createUILeftMobile(this, 'settingsMobile', 'exitMobile', 'fold', 90, 70, this.cameras.main.width - 90, 70, this.showSettings, this.showExitMenu, 90, 200, this.showFold); this.createPlayers(players, CAMERA_MARGIN_MOBILE);
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

        createAvatarDialog(this, this.enterNewSettingsInAvatarDialog, this.closeAvatarDialog, this.player.room, isMobile());

        this.createEnterCodeContainer();
    }

    createMap(map) {
        this.map = this.add.image(0, 0, map).setOrigin(0, 0);
        this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createUnWalkedObjects() {
        const bodyArca = this.matter.add.fromVertices(744 + 556, 932 + 47, '1.5 6 6.5 93 1061.5 87 1111 69 1111 1 1.5 6', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(870, 100 + 1050, '246.159 2017.41 498.794 2026.94 498.794 2052.5 0.5 2052.5 0.5 1 2046 1 2054 2049 1578.6 2049 1578.6 2025.93 1738.55 2025.93 2039 1886.5 2045.5 1777.71 1970.26 1777.71 1836.22 1751.13 1836.22 1715.02 1826.75 1585.14 1810.31 1368 1687.23 1368 1687.23 1078.66 1313.51 1067.62 1313.51 1368 1266.17 1368 1266.17 1307.83 788.303 1307.83 788.303 1634.79 746 1634.79 750 1031.5 1840.2 1022.99 1866.11 1003.94 1840.2 774.5 1789.88 750 1789.88 500.965 1163.52 500.965 1163.52 715.594 1158 839 881 839 888.959 265.274 751.43 265.274 755.5 816.389 716 816.389 709.573 399.668 554.603 399.668 554.603 810.371 486.337 810.371 486.337 862.023 241.674 869.545 228.719 927.214 125.074 935.738 52.3226 953.791 52.3226 1025.5 540.153 1025.5 540.153 1634.79 508.76 1634.79 508.76 1380.04 486.337 1380.04 374.5 1380.04 374.5 1089.19 92.6845 1089.19 125.074 1386 98.5 1440 92.6845 1526.97 31.3942 1526.97 31.3942 1887.03 138.029 1887.03 138.029 1961.24 246.159 2017.41', { isStatic: true }, true)
        const bodyCar = this.matter.add.fromVertices(1160 + 200, 1898 + 74, '1 0.5 1 147.5 399 147.5 399 94 322 0.5 1 0.5', { isStatic: true }, true)
        const barrel = this.matter.add.fromVertices(886.5 + 66.5, 1875 + 84.5, '59 1.5 18 18 5.5 33 0.5 47.5 0.5 94 5.5 168.5 132 168.5 132 78.5 132 39 121 24 103 12.5 59 1.5', { isStatic: true }, true)
    }

    createPlayers(players, cameraMargin) {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                //добовляем игрока
                this.player = this.playersController.createMainPlayer(this, players[id]);

                //настраиваем камеру игрока
                this.cameras.main.startFollow(this.player);
                this.cameras.main.setBounds(cameraMargin.left, cameraMargin.top, this.map.width + cameraMargin.right, this.map.height + cameraMargin.bottom);
            } else {
                this.playersController.createOtherPlayer(this, players[id], this.otherPlayers);
            }
        });
    }

    createCollision() {
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const bodyRightMiddleBookshel = this.matter.add.fromVertices(1315 + 183, 1081 + 143.5, '365.5 286.5 12 286.5 1 286.5 1 0.5 365.5 0.5 365.5 286.5', { label: `${LABEL_ID.FIVETH_KEY}`, isStatic: true })
        const bodyLeftMiddleBookshell = this.matter.add.fromVertices(98 + 137, 1100 + 137, '273.5 273 1 273 1 0.5 273.5 0.5 273.5 273', { label: '1', isStatic: true })
        const bodyMiddleTopBookshell = this.matter.add.fromVertices(756 + 62.5, 282 + 283, '124.5 565.5 1 565.5 1 0.5 124.5 0.5 124.5 565.5', { label: '1', isStatic: true })
        const bodyLeftTopBookShell = this.matter.add.fromVertices(573 + 67.5, 412 + 172, '134.5 343 0.5 343 0.5 1 134.5 1 134.5 343', { label: '1', isStatic: true })
        const bodyRightTopBookshell = this.matter.add.fromVertices(1173 + 305.5, 510 + 114, '610 227 1 227 1 8.00775 610 1 610 227', { label: `${LABEL_ID.SIXETH_KEY}`, isStatic: true });
        const bodyRightTopTable = this.matter.add.fromVertices(1394 + 165.5, 772 + 70, '330 1 1 1 1 139 330 139 330 1', { label: '1', isStatic: true })
        const bodyLeftBookFireplace = this.matter.add.fromVertices(781.5 + 53, 1060.5 + 146.5, '0.5 292 105 292 105 0.5 0.5 0.5 0.5 292', { label: '1', isStatic: true })
        const bodyRightBookFireplace = this.matter.add.fromVertices(1142 + 62.5, 1055 + 152, '124 303.5 1 303.5 1 1 124 1 124 303.5', { label: '1', isStatic: true })

        const bodyFire = this.matter.add.fromVertices(1426 + 82.5, 1581 + 69.5, '8.5 29 1.5 110.5 69 137.5 164 110.5 133.5 29 69 1', { label: '0', isStatic: true })

        const bodyDoor = this.matter.add.fromVertices(501 + 140, 1910.5 + 67.5, '1 0.5 1 134.5 279 134.5 279 0.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyRightBookFireplace, bodyRightTopTable, bodyLeftBookFireplace, bodyRightTopBookshell, bodyDoor, bodyFire, bodyLeftTopBookShell, bodyMiddleTopBookshell, bodyLeftMiddleBookshell, bodyRightMiddleBookshel]

        this.matterCollision.addOnCollideStart({
            objectA: this.player,
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
            objectA: this.player,
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
        const a = myMap.get('fiverthKey');
        const b = myMap.get('sixethKey');

        this.pressX = this.add.image(this.player.x, this.player.y - 50, 'pressX');
        this.pressX.setDisplaySize(this.pressX.width, this.pressX.height);
        this.pressX.setVisible(false);

        //задний фон оверлея
        this.overlayBackground = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'overlayBackground');
        this.overlayBackground.setOrigin(0.5, 0.5);
        this.overlayBackground.setDisplaySize(this.cameras.main.width - 300, this.cameras.main.height - 100);
        this.overlayBackground.setVisible(false);
        this.overlayBackground.setDepth(2);
        this.overlayBackground.setScrollFactor(0);
        this.overlayBackground.setAlpha(0);

        this.fiverthKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'fiverthKey');
        this.fiverthKey.setScale(0.85);
        this.fiverthKey.setVisible(false);
        this.fiverthKey.setDepth(2);
        this.fiverthKey.setScrollFactor(0);
        this.fiverthKey.setAlpha(0);

        this.textA = this.add.text(a.x, this.cameras.main.height / 2 - 100, decrypt(a.text), { font: "normal 26px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textA.setVisible(false);
        this.textA.setAlpha(0);

        this.sixethKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'sixethKey');
        this.sixethKey.setScale(0.85);
        this.sixethKey.setVisible(false);
        this.sixethKey.setDepth(2);
        this.sixethKey.setScrollFactor(0);
        this.sixethKey.setAlpha(0);

        this.textB = this.add.text(b.x, this.cameras.main.height / 2 - 100, decrypt(b.text), { font: "normal 26px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textB.setVisible(false);
        this.textB.setAlpha(0);

        //Текст для пустых
        this.emptySign = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'empty');
        this.emptySign.setVisible(false);
        this.emptySign.setDepth(2);
        this.emptySign.setScrollFactor(0);
        this.emptySign.setAlpha(0);

        this.answer = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'answer');
        this.answer.setScale(0.5);
        this.answer.setVisible(false);
        this.answer.setDepth(2);
        this.answer.setScrollFactor(0);
        this.answer.setAlpha(0);

        this.textC = this.add.text(this.cameras.main.width / 2 - 320, this.cameras.main.height / 2 - 130, 'Congrats!\nYou’ve made the right potion\n“437268”', { font: "normal 60px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textC.setVisible(false);
        this.textB.setAlpha(0);

        this.closeButton = this.add.image(this.cameras.main.width - 200, 85, 'closeIcon');
        this.closeButton.setDisplaySize(50, 50);
        this.closeButton.setInteractive();
        this.closeButton.setVisible(false);
        this.closeButton.setDepth(2);
        this.closeButton.setScrollFactor(0);
        this.closeButton.setAlpha(0);

        this.closeButton.on('pointerdown', () => {
            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.emptySign, this.closeButton, this.overlayBackground, this.sixethKey, this.answer, this.fiverthKey, this.textA, this.textB, this.textC],
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
            if (this.avatarDialog.visible || this.exitContainer.visible) return;
            if (this.foldKeys.visible) return;

            if (this.isInZone) {
                this.player.setVelocity(0);

                if (this.eventZone == LABEL_ID.DOOR_BACK_ID) {
                    this.moveBackRoom();
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.sixethKey, this.emptySign, this.fiverthKey, this.answer, this.textA, this.textB, this.textC],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.emptySign, this.closeButton, this.overlayBackground, this.enterCodeContainer, this.sixethKey, this.answer, this.fiverthKey, this.textA, this.textB, this.textC],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 1024, 1250);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.enterCodeContainer.setVisible(true);
            return;
        } else if (this.eventZone == LABEL_ID.SIXETH_KEY) {
            this.sixethKey.setVisible(true);
            this.textB.setVisible(true);
            if (this.fold.indexOf(this.sixethKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.sixethKey.texture.key);
            }
        } else if (this.eventZone == LABEL_ID.FIVETH_KEY) {
            this.fiverthKey.setVisible(true);
            this.textA.setVisible(true);
            if (this.fold.indexOf(this.fiverthKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.fiverthKey.texture.key);
            }
        }
        else {
            this.emptySign.setVisible(true);
        }

        this.overlayBackground.setVisible(true);
        this.closeButton.setVisible(true);
    }

    hideOverlay() {
        this.isOverlayVisible = false
        if (this.sixethKey.visible) { this.sixethKey.setVisible(false); this.textB.setVisible(false); }
        if (this.fiverthKey.visible) { this.fiverthKey.setVisible(false); this.textA.setVisible(false); }
        if (this.answer.visible) { this.answer.setVisible(false); this.textC.setVisible(false); }
        if (this.emptySign.visible) this.emptySign.setVisible(false);
        if (this.enterCodeContainer.visible) this.enterCodeContainer.setVisible(false);

        this.overlayBackground.setVisible(false);
        this.closeButton.setVisible(false);
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

        const correctCode = decryptN(cd);
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
                    this.overlayBackground.setVisible(true);
                    this.answer.setVisible(true);
                    this.answer.setAlpha(1);
                    this.textC.setVisible(true);
                    this.textC.setAlpha(1);
                    this.closeButton.setVisible(true);

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
        if (context.avatarDialog.visible || context.exitContainer.visible) return;
        if (context.foldKeys.visible) return;
        if (context.isInZone) {
            context.player.setVelocity(0);

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
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.sixethKey, context.fiverthKey, context.enterCodeContainer, context.answer, context.textA, context.textB, context.textC],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.sixethKey, context.fiverthKey, context.enterCodeContainer, context.answer, context.textA, context.textB, context.textC],
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
        super.update();
    }
}