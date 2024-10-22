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

export class GameScene2 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE2);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map2', './assets/map/laboratory_room_2.jpg');

        this.load.image('doorRoom1', './assets/map/door_room_4.png');
        this.load.image('stair', './assets/map/stair.png');
        this.load.image('balcon', './assets/map/balcon.png');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map2');

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
            objectA: this.player,
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
        const a = myMap.get('thirdKey');
        const b = myMap.get('fourthKey');

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

        this.thirdKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'thirdKey');
        this.thirdKey.setScale(0.85);
        this.thirdKey.setVisible(false);
        this.thirdKey.setDepth(2);
        this.thirdKey.setScrollFactor(0);
        this.thirdKey.setAlpha(0);

        this.textA = this.add.text(a.x, this.cameras.main.height / 2 - 100, decrypt(a.text), { font: "normal 26px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textA.setVisible(false);
        this.textA.setAlpha(0);

        this.fourthKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'fourthKey');
        this.fourthKey.setScale(0.85);
        this.fourthKey.setVisible(false);
        this.fourthKey.setDepth(2);
        this.fourthKey.setScrollFactor(0);
        this.fourthKey.setAlpha(0);

        this.textB = this.add.text(b.x, this.cameras.main.height / 2 - 100, decrypt(b.text), { font: "normal 26px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textB.setVisible(false);
        this.textB.setAlpha(0);

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
                targets: [this.closeButton, this.overlayBackground, this.emptySign, this.thirdKey, this.fourthKey, this.textA, this.textB],
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
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.thirdKey, this.fourthKey, this.textA, this.textB],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.thirdKey, this.fourthKey, this.textA, this.textB],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE, 1024, 350);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == LABEL_ID.THIRD_KEY) {
            this.thirdKey.setVisible(true);
            this.textA.setVisible(true);
            if (this.fold.indexOf(this.thirdKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.thirdKey.texture.key);
            }
        }
        else if (this.eventZone == LABEL_ID.FOURTH_KEY) {
            this.fourthKey.setVisible(true);
            this.textB.setVisible(true);
            if (this.fold.indexOf(this.fourthKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.fourthKey.texture.key);
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
        if (this.thirdKey.visible) { this.thirdKey.setVisible(false); this.textA.setVisible(false); }
        if (this.emptySign.visible) this.emptySign.setVisible(false);
        if (this.fourthKey.visible) { this.fourthKey.setVisible(false); this.textB.setVisible(false); }

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

            if (context.eventZone == LABEL_ID.DOOR_FORWARD2_ID) {
                context.moveForwardRoom2();
                return;
            }

            if (context.eventZone == LABEL_ID.DOOR_BACK_ID) {
                context.moveBackRoom();
                return;
            }

            if (!context.isOverlayVisible) {

                context.showOverlay();

                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.thirdKey, context.fourthKey, context.textA, context.textB],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.thirdKey, context.fourthKey, context.textA, context.textB],
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