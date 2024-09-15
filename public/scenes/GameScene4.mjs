import { CST, LABEL_ID } from "../CST.mjs";

import { socket } from "../CST.mjs";

import { createUILeftMobile } from "../share/UICreator.mjs";
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
        this.load.image('map4', './assets/map/library_room_4.jpg');
        this.load.image('doorRoom4', './assets/map/door_room_4.png');
        this.load.image('tableRoom4', './assets/map/table_room_4.png');
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

        this.add.image(1040, 1960, 'doorRoom4');
        this.add.image(1024, 596, 'tableRoom4');
    }

    createUnWalkedObjects() {
        const bodyLeftMiddleWall = this.matter.add.fromVertices(150 + 296, 1400 + 162, '787.5 415 749 385 737.5 343 712 335.5 649 318.5 587 253.5 538.5 207.5 458.5 186 372.5 186 308.5 214 258 250.5 230 339 157.5 339 136 292.5 109 263 62 254.5 29 263 11.5 300 6 347.5 1 347.5 1 36.5 612.5 36.5 612.5 1 749 61.5 787.5 36.5 823 69.5 809 92 809 343 835 378.5', { isStatic: true }, true)
        const bodyRightMiddleShell = this.matter.add.fromVertices(1450 + 472, 1152 + 140, '82 4 110.5 18.5 106.5 12.5 198 18.5 199.5 1029.5 180 1029.5 184.5 383.5 45 383.5 32 377.5 20.5 377.5 17.5 338.5 1 335.5 1 239.5 17.5 235.5 32 216 38.5 54 24 49 20 25.5 24 12.5 47.5 1', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(1120, 620, '896 986 886 973 873 912.5 828 883.5 770.5 883.5 755 860.5 730.5 856 718.5 810.5 730.5 793 736 772 741.5 740 718.5 740 682.5 714 661.5 728 661.5 631 674.5 583.5 667 400.5 563.5 285.5 421 275 308.5 318 240 431.5 253.5 690 209.5 699.5 209.5 799.5 166.5 810.5 172 945.5 135 984 154 1040 221 1071 221 1276 215.5 1305.5 229.5 1352 172 1334.5 154 1389.5 1 1394 14.5 0.5 2038 0.5 2038 1024.5 1941.5 1014.5 1932 922 1878 928.5 1849 928.5 1844 941 1828.5 941 1816.5 933.5 1828.5 909 1823.5 895.5 1807.5 880.5 1828.5 842.5 1837 842.5 1844 861.5 1851 883.5 1841.5 893.5 1851 909 1870.5 902.5 1875.5 883.5 1875.5 872.5 1892 856 1878 809.5 1832.5 802 1828 702 1859 702 1868.5 371.5 1859 358.5 1849.5 351.5 1846 358.5 1835.5 351.5 1840.5 344 1846 332 1840.5 327 1835.5 327 1832.5 321.5 1849.5 298.5 1826.5 273 1746.5 227.5 1731.5 294.5 1637 260.5 1571.5 250.5 1459 286.5 1380.5 326.5 1391.5 611 1369 710 1319.5 743 1319.5 815.5 1284 884.5 1201 859.5 1159.5 890.5 1159.5 952 1135 978 1110.5 972 1110.5 879.5 1246.5 749 1243 717 1243 697.5 1258.5 670 1262.5 660 1270.5 624.5 1268.5 565 1268.5 542 1277.5 367.5 1260 361 1249 355 1249 343 1256 337.5 1249 331 1249 326.5 1253 320.5 1256 309 1267.5 304.5 1246.5 279.5 1202.5 234.5 1177.5 220 996 180 900.5 207.5 775 290 795.5 314 787 338 795.5 343.5 787 355.5 779.5 355.5 767 367.5 775 631 787 636 803.5 663 809 685.5 803.5 728 806.5 740 814.5 755 818.5 761 828 766 832.5 772 841.5 779 861 781.5 870 776 875.5 781.5 886 781.5 905 795 912.5 810.5 920 823 927.5 821.5 942.5 828.5 958.5 847 951.5 870.5 951.5 916.5 929.5 935.5 929.5 969.5 919.5 986', { isStatic: true }, true)
        const bodyRightMiddleWall = this.matter.add.fromVertices(1450 + 170, 1400 + 168, '35.5 412 82 390.5 86 366.5 73 351.5 73 219.5 108.5 190.5 154.5 174.5 174 190.5 310.5 196 367 196 427.5 190.5 471.5 196 546.5 240 591.5 289 604.5 356.5 636.5 356.5 644.5 351.5 651 308.5 662 289 688.5 268.5 723.5 256 776.5 274 791 351.5 805 351.5 805 40 188.5 40 183.5 1.5 93 55.5 63 35.5 35.5 35.5 14.5 67.5 23 95.5 23 348.5 11 351.5 1.5 378', { isStatic: true }, true)
        const bodyLeftBottomWall = this.matter.add.fromVertices(10, 1400 + 340, '25 641 1 641 2.5 0.5 22 0.5', { isStatic: true }, true)
        const bodyRightBottomTable = this.matter.add.fromVertices(1495 + 245 / 2, 1655 + 234 / 2, '266.5 235 26.5 235 26.5 148.5 1.5 29.5 107.5 1 244.5 1 235.5 84.5 266.5 148.5 266.5 235', { isStatic: true }, true);
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

        const bodyMiddleTopTable = this.matter.add.fromVertices(804 + 225, 608, '1 1 1 181 454 181 454 1', { label: '0', isStatic: true });


        const bodyLeftTopBookShell = this.matter.add.fromVertices(250 + 206, 392 + 146, '374 409 1 409 1 165.5 51.5 59.5 191.5 1 338 59.5 374 165.5', { label: '1', isStatic: true });
        const bodyLeftTable1 = this.matter.add.fromVertices(250 + 192, 392 + 410, '190.5 95.5 1 91.5 1 0.5 190.5 0.5', { label: '1', isStatic: true });
        const bodyLeftTable2 = this.matter.add.fromVertices(250 + 200, 392 + 590, '252.5 1 4.5 1 1.5 90.5 248.5 87.5', { label: '1', isStatic: true });
        const bodyLeftTable3 = this.matter.add.fromVertices(250 + 214, 392 + 732, '272 0.5 1 0.5 1 82.5 267 87.5', { label: '1', isStatic: true });
        const bodyLeftTable4 = this.matter.add.fromVertices(250 + 196, 392 + 880, '243 1 1 1 1 87.5 246.5 87.5', { label: `${LABEL_ID.SIXETH_KEY}`, isStatic: true });
        const bodyLeftBottomTable2 = this.matter.add.fromVertices(336 + 232 / 2, 1810 + 84 / 2, '1 85 1 0.5 233 0.5 233 85', { label: '1', isStatic: true });
        const bodyLeftBottomTable1 = this.matter.add.fromVertices(305.5 + 122.5, 1636 + 48, '0.5 95 0.5 1 244.5 1 244.5 95 0.5 95', { label: '1', isStatic: true });


        const bodyLeftMiddleBookshell = this.matter.add.fromVertices(1500 + 168, 392 + 950, '189 2 0.5 0.5 2 125.5 191.5 125.5', { label: '1', isStatic: true });
        const bodyRightTable3 = this.matter.add.fromVertices(1500 + 116, 392 + 680, '412.5 71.5 1 71.5 5.5 0.5 412.5 0.5', { label: '1', isStatic: true });
        const bodyRightTable2 = this.matter.add.fromVertices(1500 + 48, 392 + 540, '309.5 42.5 251.5 80 26.5 80 1.5 42.5 26.5 0.5 256.5 0.5', { label: '1', isStatic: true });
        const bodyRightTable1 = this.matter.add.fromVertices(1500 + 112, 390 + 380, '275.5 70 1 70 11 1 275.5 1', { label: '1', isStatic: true });
        const bodyRightTopBookshell = this.matter.add.fromVertices(1500 + 96, 392 + 160, '1 162.5 1 395 384 395 384 162.5 328.5 54.5 188.5 1 61 54.5', { label: '1', isStatic: true });

        const bodyDoor = this.matter.add.fromVertices(942 + 86, 1900 + 80, '8 130.5 1 190.5 544.5 190.5 508.5 142.5 422.5 62.5 309 0.5 217 0.5 115.5 56.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyLeftBottomTable1, bodyLeftBottomTable2, bodyDoor, bodyLeftTopBookShell, bodyMiddleTopTable, bodyRightTable3, bodyRightTable2, bodyRightTable1, bodyRightTopBookshell, bodyLeftMiddleBookshell, bodyLeftTable1, bodyLeftTable2, bodyLeftTable3, bodyLeftTable4]

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

        this.sixethKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'sixethKey');
        this.sixethKey.setScale(0.25);
        this.sixethKey.setVisible(false);
        this.sixethKey.setDepth(2);
        this.sixethKey.setScrollFactor(0);
        this.sixethKey.setAlpha(0);

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
                targets: [this.closeButton, this.overlayBackground, this.sixethKey, this.emptySign, this.answer],
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
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.sixethKey, this.emptySign, this.answer],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.enterCodeContainer, this.sixethKey, this.emptySign, this.answer],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE3, 1024, 800 - 111);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == 0) {
            this.enterCodeContainer.setPosition(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360);
            this.enterCodeContainer.setVisible(true);
            return;
        } else if (this.eventZone == LABEL_ID.SIXETH_KEY) {
            this.sixethKey.setVisible(true);
            if (this.fold.indexOf(this.sixethKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.sixethKey.texture.key);
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
        // if (this.eventZone == 0) {
        //     this.enterCodeContainer.setVisible(false);
        //     if (this.answer.visible) {
        //         this.answer.setVisible(false);
        //         this.overlayBackground.setVisible(false);
        //         this.closeButton.setVisible(false);
        //     }
        //     return;
        // }
        // else if (this.eventZone == LABEL_ID.SIXETH_KEY) this.sixethKey.setVisible(false);
        // else {
        //     this.emptySign.setVisible(false);
        // }
        if (this.sixethKey.visible) this.sixethKey.setVisible(false);
        if (this.answer.visible) this.answer.setVisible(false);
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

        const correctCode = 'OKOLIZ';
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
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.sixethKey, context.enterCodeContainer, context.answer],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.sixethKey, context.enterCodeContainer, context.answer],
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
