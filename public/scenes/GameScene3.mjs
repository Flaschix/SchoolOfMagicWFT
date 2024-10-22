import { CST, LABEL_ID } from "../CST.mjs";

import { socket } from "../CST.mjs";

import { createUILeftMobile, decrypt } from "../share/UICreator.mjs";
import { createUI } from "../share/UICreator.mjs";
import { createAvatarDialog } from "../share/UICreator.mjs";
import { isMobile } from "../share/UICreator.mjs";
import { CAMERA_MARGIN, CAMERA_MARGIN_MOBILE } from "../share/UICreator.mjs";

import { createJoystick } from "../share/UICreator.mjs";
import { createMobileXButton } from "../share/UICreator.mjs";

import { myMap } from "../CST.mjs";

import { BaseScene } from "./BaseScene.mjs";

export class GameScene3 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE3);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map3', './assets/map/laboratory_room_4.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map3');

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

        this.add.image(1030, 1956, 'doorRoom1');
    }

    createUnWalkedObjects() {
        const bodyMainWall = this.matter.add.fromVertices(774.5, 538 + 1024.5, '796 2007 788.5 2043.5 788.5 2048 0.5 2048 11.5 1 2048 1 2048 2047 1487 2047 1515 2018 1743.5 2027 1779.5 2027 1791.5 2017 1810.5 1998 1820.5 1989 1837 1989 1875 1981.5 1829 1561.5 1919 1556 1919 1275 1930 623 1925 200.5 1366 192 1366 605 853 612 595 483 595 334 377 334 377 483 118.5 602 118.5 1537 105 1578.5 118.5 1618 105 1664 192 1670.5 183 1708 192 1742.5 218.5 1756 227 1772.5 218.5 1799.5 218.5 1832.5 240.5 1842.5 227 1867 227 1909.5 253 1901.5 267.5 1928 280.5 1949 253 1969.5 275 1969.5 312 1974.5 333 2002.5 358.5 2020.5 437 2007 540.5 2007 594 1996 616 1974.5 647 1955 676 1938 718.5 1938 727 1949 752.5 1955 775 1974.5 796 1988 796 2007', { isStatic: true }, true)
        const bodyFireRightBottom = this.matter.add.fromVertices(1193 + 151.5, 1820 + 119, '8.5 112 1 146.5 12 172 34 197 48.5 217 77.5 226.5 93.5 237.5 228.5 237.5 268.5 215.5 302 162 296 112 274.5 79.5 242.5 61 208.5 52 168.5 48 168.5 30.5 168.5 11 151.5 1 135 13.5 135 30.5 135 48 110.5 48 41.5 70 8.5 112', { isStatic: true }, true);
        const bodyFireplaceMiddle = this.matter.add.fromVertices(1484.5 + 92.5, 1428 + 181.5, '48 352 14.5 320.5 8.5 311.5 8.5 287.5 18 270.5 18 243.5 14.5 233 1.5 225.5 3.5 209 14.5 191 14.5 174 5.5 147 10.5 138.5 14.5 137.5 29 108 23.5 101 23.5 88.5 27.5 78 39 70 50 70 55.5 60.5 72 29 79 14 84.5 5 95.5 1 112 5 125 18.5 125 52 161 88.5 183 132 191 143.5 192 156.5 184 183 177 194.5 186.5 197 191 203.5 188.5 211.5 184 216 183 254.5 183 297 175.5 320.5 162 347 112 362.5 77 362.5 48 352', { isStatic: true }, true)
        const bodyBarrelRightMiddle = this.matter.add.fromVertices(1541 + 45, 1156 + 61.5, '26 122 4.5 101.5 1 67.5 4.5 37.5 10 17 27 6.5 51 1 83.5 17 89.5 59 86 103 74 115.5 59.5 122', { isStatic: true }, true);
        const bodyMiddleLeftWall = this.matter.add.fromVertices(301.5 + 299, 748 + 253.5, '597.5 506.5 0.5 506.5 0.5 1 597.5 1 597.5 506.5', { isStatic: true }, true);
        const bodyRightStair = this.matter.add.fromVertices(1107 + 20.5, 735 + 303.5, '40 1 9.1039 1 1 606 40 606 40 1', { isStatic: true }, true);
        const bodyLeftStair = this.matter.add.fromVertices(901.5 + 21, 744 + 304.5, '32.6049 1 1 1 1 608 41 608 32.6049 1', { isStatic: true }, true);
        const bodyRightRightStait = this.matter.add.fromVertices(264.5 + 15, 744 + 319, '29 1 1 1 6.40351 637 29 637 29 1', { isStatic: true }, true);
        const rightMinWall = this.matter.add.fromVertices(1114 + 406, 721 + 15, '1 1 1 29.5 811.5 29.5 811.5 1', { isStatic: true }, true)
        const leftMinWall = this.matter.add.fromVertices(263 + 336, 721 + 15, '1 29.5 671 29.5 671 1 1 1', { isStatic: true }, true)
        const leftShell = this.matter.add.fromVertices(520 + 83, 1022 + 139, '1 1 1 277.5 165.5 277.5 165.5 1', { isStatic: true }, true)
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

        const bodyMiddleTable = this.matter.add.fromVertices(1192 + 136.5, 1400.5 + 41.5, '271.5 82.5 7 82.5 1 82.5 7 0.5 265 0.5', { label: '1', isStatic: true })
        const bodyMiddeleRightShell = this.matter.add.fromVertices(1750 + 71.5, 1218 + 156, '9.5 311.5 137.5 311.5 142.5 311.5 142.5 0.5 1 0.5 ', { label: '1', isStatic: true })
        const bodyMiddleRightShell1 = this.matter.add.fromVertices(1150 + 182, 753.5 + 240, '363 479 8 479 1 479 1 0.5 363 3.5 363 479', { label: '1', isStatic: true })
        const bodyMiddleRightShell2 = this.matter.add.fromVertices(1517.5 + 198, 759 + 239, '395 1 9 1 0.5 477 395 477 395 1', { label: '1', isStatic: true })
        const bodyTopRightShell1 = this.matter.add.fromVertices(1379.5 + 128, 203.5 + 206.5, '255.5 412 0.5 412 0.5 0.5 255.5 0.5 255.5 412', { label: `${LABEL_ID.SECOND_KEY}`, isStatic: true })
        const bodyTopRightShell2 = this.matter.add.fromVertices(1641 + 142, 206.5 + 206, '283.5 0.5 1 0.5 1 411.5 283.5 411.5 283.5 0.5', { label: '1', isStatic: true })
        const bodyKamin = this.matter.add.fromVertices(385.5 + 102.5, 345.5 + 70.5, '204 140 14 140 0.5 140 0.5 0.5 204 0.5 204 140', { label: '1', isStatic: true })
        const bodyMiddleLeftTable = this.matter.add.fromVertices(519 + 86, 1298.5 + 79, '1 6.5 1 157.5 170.5 157.5 164.5 1.5', { label: '1', isStatic: true })


        const bodyDoorBack = this.matter.add.fromVertices(942 + 80, 1900 + 74, '8 130.5 1 190.5 544.5 190.5 508.5 142.5 422.5 62.5 309 0.5 217 0.5 115.5 56.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyKamin, bodyMiddleLeftTable, bodyTopRightShell2, bodyTopRightShell1, bodyMiddleRightShell2, bodyMiddleRightShell1, bodyMiddeleRightShell, bodyMiddleTable, bodyDoorBack];

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
        const a = myMap.get('secondKey');

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

        //Пятый ключ
        this.secondKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'secondKey');
        this.secondKey.setScale(0.85);
        this.secondKey.setVisible(false);
        this.secondKey.setDepth(2);
        this.secondKey.setScrollFactor(0);
        this.secondKey.setAlpha(0);

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
                targets: [this.closeButton, this.overlayBackground, this.emptySign, this.secondKey, this.textA],
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
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.secondKey, this.textA],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.secondKey, this.textA],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 1024, 700);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == LABEL_ID.SECOND_KEY) {
            this.secondKey.setVisible(true);
            this.textA.setVisible(true);
            if (this.fold.indexOf(this.secondKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.secondKey.texture.key);
            }
        }
        else {
            this.emptySign.setVisible(true);;
        }

        this.overlayBackground.setVisible(true);
        this.closeButton.setVisible(true);
    }

    hideOverlay() {
        this.isOverlayVisible = false
        if (this.secondKey.visible) {
            this.secondKey.setVisible(false);
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


            if (context.eventZone == LABEL_ID.DOOR_BACK_ID) {
                context.moveBackRoom();
                return;
            }

            if (!context.isOverlayVisible) {

                context.showOverlay();

                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.secondKey, context.textA],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.secondKey, context.textA],
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
