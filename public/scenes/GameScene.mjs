import { CST, LABEL_ID } from "../CST.mjs";

import { socket } from "../CST.mjs";

import { createUILeftMobile, decrypt } from "../share/UICreator.mjs";
import { createUI } from "../share/UICreator.mjs";
import { createAvatarDialog } from "../share/UICreator.mjs";
import { isMobile } from "../share/UICreator.mjs";
import { CAMERA_MARGIN, CAMERA_MARGIN_MOBILE } from "../share/UICreator.mjs";

import { createJoystick } from "../share/UICreator.mjs";

import { myMap } from "../CST.mjs";
import { createMobileXButton } from "../share/UICreator.mjs";

import { BaseScene } from "./BaseScene.mjs";

export class GameScene extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map', './assets/map/laboratory_room_1.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map');

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
    }

    createMap(map) {
        this.map = this.add.image(0, 0, map).setOrigin(0, 0);
        this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createUnWalkedObjects() {
        const bodyDownWall = this.matter.add.fromVertices(0 + 1022.5, 1994 + 25.5, '2044.5 1 1 1 1 50.5 2044.5 50.5 2044.5 1', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(1164.5, 870, '50.5 569 38.5 2049 1 2049 1 9.5 2048 0.5 2048 2047.5 1997.5 2047.5 1981.5 1416 1888 1286.5 1592.5 1278.5 1423 1353 1423 1795 1343 1795 1343 1441 1313.5 1353 1232 1278.5 826 1271.5 759.5 1311.5 708.5 1362.5 708.5 1795 626 1795 635 1214 1997.5 1221 1997.5 753.5 1889 753.5 1889 628 1407 628 1277.5 609.5 1181.5 638.5 1181.5 816.5 1142.5 816.5 1142.5 371.5 1142.5 248.5 1142.5 156.5 1126.5 106 1096 63 946.5 63 913 106 897 147 905 816.5 827.5 816.5 827.5 314 455 314 445.5 569 50.5 569', { isStatic: true }, true)
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
        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);
        highlightGraphics.setDepth(0);

        // Создаем область, через которую игрок не может пройти
        const bodyCLeftBottomCandel = this.matter.add.fromVertices(56 + 50, 1545 + 147, '81 373 14.5 373 8.5 367 6 225.5 26 203 36 184 28.5 102 1.5 73.5 8.5 35.5 28.5 35.5 36 23.5 43.5 5.5 56 1 62 19.5 64 27.5 62 35.5 81 35.5 91 51.5 99 86.5 62 96 56 184 84.5 218 81 373', { label: '1', isStatic: true })
        const bodyBookshellMiddle = this.matter.add.fromVertices(706 + 319.5, 1435 + 173.5, '1 1 1 254.121 230.5 346 419 346 638 254.121 638 1 1 1', { label: '1', isStatic: true })
        const bodyBookshellMiddleRight = this.matter.add.fromVertices(1421 + 278, 1544 + 82.5, '1 164 555 164 555 1 1 6 1 164', { label: `${LABEL_ID.FIRST_KEY}`, isStatic: true })
        const bodyTableMiddleLeft = this.matter.add.fromVertices(48 + 56.5, 573 + 272.5, '112.5 544.5 1 544.5 1 1 107 1 112.5 544.5', { label: '1', isStatic: true })
        const bodyBookshellTopLeft = this.matter.add.fromVertices(451 + 183.5, 323 + 130.5, '366.5 260 1 260 7.5 1 366.5 1', { label: '1', isStatic: true })
        const bodyShellMiddle = this.matter.add.fromVertices(1181 + 114, 610 + 166, '1 34 1 292.5 111 331 227.5 299.5 227.5 20.5 93 1 1 34', { label: '1', isStatic: true })
        const bodyBookshellRightTop = this.matter.add.fromVertices(1420 + 201.5, 633 + 126, '402.5 0.5 1 0.5 1 251.5 402.5 251.5 402.5 0.5', { label: '1', isStatic: true })
        const bodyTableMiddleRight = this.matter.add.fromVertices(1896 + 47.5, 756 + 159, '0.5 317.5 94 317.5 94 0.5 0.5 0.5 0.5 317.5', { label: '1', isStatic: true })
        const bodyBonfire = this.matter.add.fromVertices(146 + 106.5, 1674 + 118.5, '136.5 256.5 53.5 256.5 29 245.5 9 233.5 12.5 195 16 167 9 149.5 0.5 131.5 0.5 118.5 5.5 106.5 19 89.5 35.5 76.5 52 69.5 58 51.5 58 24 65.5 13.5 74 7 88 4 110 0.5 129.5 5.5 143.5 16.5 155.5 38.5 162 66 181 71.5 196.5 84.5 209 98 212 112.5 209 122 196.5 131.5 200.5 139.5 200.5 145.5 191 162.5 196.5 186 203 207.5 203 228 188.5 239 170.5 245.5 136.5 256.5', { label: '1', isStatic: true })
        const bodyDoor = this.matter.add.fromVertices(901.5 + 116, 59 + 115.5, '0.5 57 0.5 230.5 231.5 230.5 231.5 57 183 1 43 1 0.5 57', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyBookshellMiddle, bodyBookshellMiddleRight, bodyTableMiddleLeft, bodyBookshellTopLeft, bodyShellMiddle, bodyBookshellRightTop, bodyTableMiddleRight, bodyDoor];


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
        const a = myMap.get('firstKey');

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

        //Первый ключ
        this.firstKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'firstKey');
        this.firstKey.setScale(0.85);
        this.firstKey.setVisible(false);
        this.firstKey.setDepth(2);
        this.firstKey.setScrollFactor(0);
        this.firstKey.setAlpha(0);

        this.textA = this.add.text(a.x, this.cameras.main.height / 2 - 100, decrypt(a.text), { font: "normal 26px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textA.setVisible(false);
        this.textA.setAlpha(0);

        //Текст для пустых
        this.emptySign = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'empty');
        this.emptySign.setVisible(false);
        this.emptySign.setDepth(2);
        this.emptySign.setScrollFactor(0);
        this.emptySign.setAlpha(0);

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
                targets: [this.closeButton, this.overlayBackground, this.emptySign, this.firstKey, this.textA],
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

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                    this.moveForwardRoom();
                    return;
                }

                if (!this.isOverlayVisible) {

                    this.showOverlay();

                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.firstKey, this.textA],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.firstKey, this.textA],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 960, 1850);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == LABEL_ID.FIRST_KEY) {
            this.firstKey.setVisible(true);
            this.textA.setVisible(true);
            if (this.fold.indexOf(this.firstKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.firstKey.texture.key);
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
        if (this.firstKey.visible) {
            this.firstKey.setVisible(false);
            this.textA.setVisible(false);
        }
        if (this.emptySign.visible) this.emptySign.setVisible(false);

        this.overlayBackground.setVisible(false);
        this.closeButton.setVisible(false);
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

            if (!context.isOverlayVisible) {

                context.showOverlay();

                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.firstKey, context.textA],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.firstKey, context.textA],
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
