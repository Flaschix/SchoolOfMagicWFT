import { CST, LABEL_ID } from "../CST.mjs";

import { socket } from "../CST.mjs";

import { createUILeftMobile, decryptN } from "../share/UICreator.mjs";
import { createUI } from "../share/UICreator.mjs";
import { createAvatarDialog } from "../share/UICreator.mjs";
import { isMobile } from "../share/UICreator.mjs";
import { CAMERA_MARGIN, CAMERA_MARGIN_MOBILE } from "../share/UICreator.mjs";

import { createJoystick } from "../share/UICreator.mjs";
import { createMobileXButton } from "../share/UICreator.mjs";

import { BaseScene } from "./BaseScene.mjs";

export class GameScene2 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE2);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map2', './assets/map/library_room_22.jpg');
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
    }

    createUnWalkedObjects() {
        const bodyMainWall = this.matter.add.fromVertices(976, 1250, '872 1705 872 2042 0.5 2044.5 0.5 1 2045.5 1 2045.5 2048.5 1171.5 2045.5 1171.5 1968 1171.5 1880.5 1171.5 1822.5 1164 1773 1164 1757 1158.5 1709.5 1158.5 1688 1155 1678 1145.5 1656.5 1145.5 1641 1155 1624.5 1158.5 1605.5 1171.5 1595 1183 1605.5 1183 1628 1197.5 1650.5 1205.5 1688 1223 1703.5 1388 1669.5 1401 1641 1431 1661 1498 1757 1521.5 1778 1540 1832 1619 1890 1842 1873.5 1928 1816.5 1987 1734 1967 1701.5 1987 1683.5 1987 1613 1951.5 1596.5 1935.5 1439.5 1928 1345.5 1976.5 1350 1951.5 1336 1928 1308.5 1886 1302.5 1886 1263 1886 1160 1922 1143.5 1922 1084.5 1928 1043.5 1913 865.5 1895 861 1886 853.5 1886 621.5 1548.5 621.5 1548.5 804 1548.5 835 1527.5 847.5 1489.5 847.5 1478 835 1482.5 469 1375 469 1375 823 1345.5 853.5 1315 847.5 1302 810 1166.5 810 1166.5 796 1149 692 1149 535 1123 474 1102 443.5 1051 423 1013 423 948.5 456 909.5 535 897.5 796 889.5 796 828 816 747 784 741 804 736 849 684.5 834.5 676.5 468 567.5 468 553.5 746.5 506.5 756 500.5 618 163.5 618 163.5 786.5 124.5 821.5 114 890.5 86.5 962 86.5 1218 70.5 1279.5 79.5 1279.5 90.5 1250 90.5 1233.5 100 1215.5 114 1213.5 122 1243 131.5 1268.5 142 1288.5 114 1337 106.5 1420.5 96 1490 96 1609 72.5 1759 119.5 1819 169.5 1859 223.5 1879 359 1887.5 398.5 1887.5 427 1859 473 1833 473 1814.5 473 1786 484 1773.5 503 1773.5 551.5 1722 576 1694 614 1673.5 690 1680.5 814.5 1709 832 1694 840 1680.5 851 1667 851 1651.5 856.5 1630 863 1610 872 1600 888.5 1630 909 1651.5 909 1680.5', { isStatic: true }, true);
        const bodyRightBottomBoxes = this.matter.add.fromVertices(1829 + 80, 1603 + 150, '113.5 5.5 127 1 154.5 10 154.5 76.5 136 102 154.5 135 136 198.5 113.5 198.5 92 195 75.5 203 60.5 212 42 238 20 238 9 230.5 1 206.5 3 195 7.5 188.5 19 182 42 179 51 171 57 164 63.5 162 63.5 102 68.5 67 102 53 107 15.5', { isStatic: true }, true);
        const bodyRightMiddleBoxes = this.matter.add.fromVertices(1827 + 50, 1335 + 136, '90.5 0.5 104.5 13 111.5 177 121 242.5 110 281 99.5 293 69 293 48 277 33.5 250.5 41.5 218 33.5 204.5 23 196.5 9 186 0.5 159.5 0.5 131.5 9 104.5 20 86 14 51 20 13 33.5 0.5', { isStatic: true }, true);
        const bodyLeftTopBarrel = this.matter.add.fromVertices(490 + 42, 748 + 66, '72.5 110 40 120 19.5 114.5 5.5 104 1 88 1 68 1 46.5 8 23 14.5 11 29 0.5 61.5 0.5 78 14 84 35 86.5 83.5', { isStatic: true }, true);
        const bodyLeftMiddleBarrel = this.matter.add.fromVertices(112 + 40, 1326 + 66, '48 125.5 9 125.5 1 113 1 85 1 53.5 5 22.5 16 8.5 55.5 1.5 82.5 14.5 88 44 93.5 74.5 79 119', { isStatic: true }, true);

        const bodyLeftBottomBookshell = this.matter.add.fromVertices(380 + 164, 1443 + 85, '32 94 32 238 305.5 238 305.5 94 324 94 324 0.5 1 0.5 1 94', { isStatic: true });
        const bodyRightBottomBookshell = this.matter.add.fromVertices(1384 + 164, 1436 + 108, '19 246 314 251 314 100.5 325.5 100.5 325.5 0.5 0.5 6.5 0.5 91.5 19 100.5', { label: '1', isStatic: true });
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
        const bodyDoor = this.matter.add.fromVertices(900 + 131, 626, '13.5 103.5 1 384 262 378 246 103.5 207.5 35.5 129.5 -1 56 35.5', { label: `${LABEL_ID.DOOR_FORWARD_ID}`, isStatic: true });
        const bodyRightDoorBookshell = this.matter.add.fromVertices(1374 + 56, 469 + 170, '106.5 348.5 9 348.5 0.5 348.5 0.5 1 9 1 106.5 1', { label: '1', isStatic: true });
        const bodyLeftDoorBookshell = this.matter.add.fromVertices(558 + 67, 469 + 176, '12.5 333 107.5 333 107.5 0.5 0.5 0.5 0.5 283', { label: '1', isStatic: true });
        const bodyLeftBottomBookshell = this.matter.add.fromVertices(381 + 165, 1443 + 168, '1 1 1 149 251 149 251 1', { label: '1', isStatic: true });


        const bodyRightBottomBookshell = this.matter.add.fromVertices(1384 + 164, 1436 + 178, '1 1 1 149 251 149 251 1', { label: '1', isStatic: true });
        const bodyRightTopBookshell = this.matter.add.fromVertices(1551 + 166, 624 + 92, '334 0.5 0.5 0.5 0.5 183 93.5 195 239 195 334 183', { label: '1', isStatic: true });
        const bodyLeftTopBookshell = this.matter.add.fromVertices(165 + 164, 623 + 92, '0.5 1 0.5 188.5 315 188.5 332.5 125.5 332.5 1', { label: `${LABEL_ID.THIRD_KEY}`, isStatic: true });

        const bodyRightMiddleTable1 = this.matter.add.fromVertices(1305 + 42, 1027 + 76, '79.5 145.5 0.5 145.5 0.5 0.5 79.5 0.5', { label: '1', isStatic: true });
        const bodyLeftMiddleTable1 = this.matter.add.fromVertices(648 + 45, 1026 + 76, '86 148.5 0.5 155 0.5 0.5 86 0.5', { label: '1', isStatic: true });
        const bodyRightMiddleTable2 = this.matter.add.fromVertices(1587 + 45, 1019 + 80, '90 160 5.5 157.5 1 1.5 90 6', { label: `${LABEL_ID.FOURTH_KEY}`, isStatic: true });
        const bodyLeftMiddleTable2 = this.matter.add.fromVertices(368 + 46, 981 + 62, '93 197.5 7.5 197.5 1 55 7.5 43.5 33 28.5 33 13.5 45 0.5 59.5 0.5 59.5 23 84.5 55', { label: '1', isStatic: true });
        const bodyRightMiddleTrashTable = this.matter.add.fromVertices(1756 + 74, 865 + 154, '26.5 214.5 21 232 28.5 243 34 247 46 247 53 237.5 58.5 230 65.5 230 75.5 230 78.5 208 102 198 148 198 169 214.5 169 208 172.5 171 165 109 160 1 152.5 1 140 1 118.5 7 102 11.5 90 1 65.5 1 33.5 11.5 26.5 33 26.5 50.5 10 66 1.5 97.5 26.5 131.5 26.5 182.5 21 198 12.5 195 4.5 198 4.5 214.5 21 221.5', { label: '1', isStatic: true });
        const bodyLeftMiddleTrashTable = this.matter.add.fromVertices(119 + 94, 832 + 76, '143.5 236 6 236 1 236 6 88.5 13 11.5 23.5 1 41 11.5 74 11.5 82 38 92 38 92 23.5 101.5 1 118 1 118 23.5 130 66 151.5 88.5 151.5 169.5 130 195', { label: '1', isStatic: true });
        const bodyLeftBottomTable = this.matter.add.fromVertices(73 + 110, 1610 + 88, '59 5 6.5 1 1 145.5 18.5 175 69.5 225 92 225 127.5 208.5 139 185 139 170.5 151 154.5 155.5 136 155.5 100 151 37 117 27 114 22.5 103 11.5 92 16 85 5', { label: '1', isStatic: true });
        const bodyDoorBack = this.matter.add.rectangle(1024, 2000, 300, 360, { label: `${LABEL_ID.DOOR_BACK_ID}`, isStatic: true, isSensor: true });


        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const arrBodies = [bodyDoorBack, bodyDoor, bodyLeftMiddleTrashTable, bodyRightMiddleTrashTable, bodyLeftMiddleTable2, bodyRightMiddleTable2, bodyRightMiddleTable1, bodyLeftMiddleTable1, bodyRightDoorBookshell, bodyLeftDoorBookshell, bodyLeftBottomBookshell, bodyRightBottomBookshell, bodyLeftBottomTable, bodyLeftTopBookshell, bodyRightTopBookshell];

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

        //Первый ключ
        this.thirdKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'thirdKey');
        this.thirdKey.setScale(0.5);
        this.thirdKey.setVisible(false);
        this.thirdKey.setDepth(2);
        this.thirdKey.setScrollFactor(0);
        this.thirdKey.setAlpha(0);

        this.textA = this.add.text(250 * 2.4, this.cameras.main.height / 2, decryptN('69'), { font: "normal 60px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textA.setVisible(false);
        this.textA.setAlpha(0);

        //Второй ключ
        this.fourthKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'fourthKey');
        this.fourthKey.setScale(0.5);
        this.fourthKey.setVisible(false);
        this.fourthKey.setDepth(2);
        this.fourthKey.setScrollFactor(0);
        this.fourthKey.setAlpha(0);

        this.textB = this.add.text(250 * 3, this.cameras.main.height / 2, decryptN('29'), { font: "normal 60px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE3, 1024, 1840 - 111);
    }

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE, 1024, 700);
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
        if (this.thirdKey.visible) {
            this.thirdKey.setVisible(false);
            this.textA.setVisible(false);
        }
        if (this.fourthKey.visible) {
            this.fourthKey.setVisible(false);
            this.textB.setVisible(false);
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
