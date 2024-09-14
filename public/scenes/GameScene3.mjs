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
import { BaseScene } from "./BaseScene.mjs";

export class GameScene3 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE3);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map3', './assets/map/library_room_33.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map3');

        if (this.mobileFlag) {
            createJoystick(this, 'joystickBase', 'joystickThumb', this.isDragging, 160, this.cameras.main.height - 120);
            createMobileXButton(this, 'touchButton', 'joystickBase', this.cameras.main.width - 150, this.cameras.main.height - 120, this.itemInteract);
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
        const bodyRightDownWall = this.matter.add.fromVertices(1441 + 80, 1865 + 64 - 111, '25.5 104.5 25.5 181 378.5 181 326 104.5 261.5 62.5 114 26 25.5 14 9.5 1.5 1 20.5 9.5 48.5 9.5 83.5', { isStatic: true }, true)
        const bodyLeftDownWall = this.matter.add.fromVertices(1 + 290, 1679 + 170 - 111, '550 290.5 557.5 368.5 5 368.5 0.5 153.5 123 153.5 132.5 153.5 173.5 153.5 217 137 233 111 229 83 229 64.5 237 58.5 237 34.5 243 1 251.5 1 251.5 17 259 46.5 263.5 64.5 268.5 114 259 114 259 145.5 251.5 182.5 276 189 280 198 268.5 198 268.5 244 299 260 365 231.5 514 203.5 577.5 191.5 569.5 244 569.5 273', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(944 + 197, 915 + 242 - 111, '1753.5 1871 1771 1866 1771 1866 1788.5 1861 1840 1871 1804.5 1856 1782 1829 1782 1788 1782 1769.5 1782 1747 1788.5 1747 1788.5 1718.5 1799 1679.5 1804.5 1679.5 1804.5 1690 1814 1747 1814 1779 1820 1806 1840 1821 1922.5 1829 1928 1685.5 1928 1641 1877.5 1647.5 1850 1641 1814 1626.5 1774.5 1587 1774.5 1577.5 1782 1570 1782 1457.5 1782 1411.5 1782 1393 1782 1373.5 1786.5 1347 1793 1308 1803 1308 1814 1341 1820.5 1360 1814 1393 1814 1411.5 1850 1430.5 1896 1426 1928 1401.5 1928 1360 1935 1270 1935 1028 1817 958 1817 907 1694.5 794.5 1674.5 757 1597 762.5 1592.5 816 1550.5 855.5 1550.5 926 1526.5 952 1513 999 1485.5 1023 1460 999 1460 668 1212.5 668 1190 757 1194.5 995 1168.5 1023 1161 1073.5 1149 1102 1105.5 1102 1096.5 761 1140.5 736 1128.5 561.5 1134 492 1045 384.5 975 384.5 894.5 476.5 894.5 726.5 920.5 749.5 925 1108 874 1108 859.5 1066 831.5 1011 825 761 558.5 756.5 564.5 1005 527 1035.5 466 965.5 475 879.5 458.5 846 376.5 797.5 358.5 802.5 231.5 905.5 231.5 984.5 210 1000.5 152.5 1043 144 1079 115 1104 120 1397.5 130.5 1411 158.5 1431 204.5 1431 225.5 1411 225.5 1397.5 225.5 1379.5 225.5 1359.5 231.5 1347 231.5 1331 231.5 1314 239.5 1303.5 250 1314 250 1331 255.5 1347 263.5 1379.5 263.5 1562.5 276.5 1582.5 225.5 1623 177 1633.5 120 1623 124.5 1827.5 0.5 1827.5 0.5 0.5 2048 0.5 2048 2046 1820.5 2046 1799 2019.5 1774.5 1978.5 1774.5 1935 1774.5 1900.5', { isStatic: true }, true)
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

    createOtherPlayersTest(context, players) {
        Object.keys(players).forEach((id) => {
            if (!(id === socket.id) && otherPlayers[id] == null) {
                context.playersController.createOtherPlayer(context, players[id], otherPlayers);
            }
        });
    }


    createCollision() {

        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const bodyDoor = this.matter.add.fromVertices(892 + 120, 500 + 90 - 111, '0.5 91 0.5 328.5 168.5 328.5 168.5 78.5 139 28.5 84 1.5 27.5 33.5', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
        });
        const bodyRightBottomTable = this.matter.add.fromVertices(1352 + 90, 1628 + 44 - 111, '92 144.5 34.5 133 1 99 1 71.5 11 38 34.5 10 72 1 125.5 10 164 51.5 149.5 118.5', { label: '1', isStatic: true });
        const bodyRightMiddleTable = this.matter.add.fromVertices(1286 + 160, 1189 + 112 - 111, '180 1.5 1.5 165.5 124.5 258.5 303 87.5', { label: '1', isStatic: true });

        const bodyRightMiddleShell = this.matter.add.fromVertices(1760 + 98, 990 + 220 - 111, '1 260 126.5 339 148.5 282 148.5 64 66 1.5 1 58.5', { label: `${LABEL_ID.FIVETH_KEY}`, isStatic: true });
        const bodyRightTopShell = this.matter.add.fromVertices(1539 + 146, 760 + 170 - 111, '1.5 83.5 11 170 169 302 259.5 226.5 259.5 126.5 89.5 1', { label: '1', isStatic: true });
        const bodyRightTopBookshell = this.matter.add.fromVertices(1200 + 125, 680 + 154 - 111, '254 1 254 327 1 327 1 98.8 18.5154 1', { label: '1', isStatic: true });
        const bodyLeftTopBookshell = this.matter.add.fromVertices(560 + 135, 770 + 122 - 111, '270.5 235.5 6 235.5 1 1 263.5 4.5', { label: '1', isStatic: true });
        const bodyLeftMiddleTable = this.matter.add.fromVertices(540 + 110, 1050 + 100 - 111, '97 26.5 1 132.5 1 207.5 48 221.5 107.5 207.5 220 103 205 26.5 153 1.5', { label: '1', isStatic: true });
        const bodyLeftTopShell = this.matter.add.fromVertices(249 + 100, 811 + 130 - 111, '223.5 178 100 279.5 88 279.5 1 199 1 112 130 1 211 49.5 234.5 89.5', { label: '1', isStatic: true });
        const bodyLeftMiddleShell = this.matter.add.fromVertices(125 + 65, 1020 + 195 - 111, '147.5 245 7 339.5 0.5 70 106.5 1.5 147.5 46.5', { label: '1', isStatic: true });
        const bodyLeftBottomTable = this.matter.add.fromVertices(450 + 80, 1622 + 52 - 111, '164.5 63.5 144 128.5 107.5 151 62 153.5 25.5 144 0.5 99 0.5 63.5 31.5 22.5 93.5 1 140 22.5', { label: `${LABEL_ID.CLUE_KEY}`, isStatic: true });

        const bodyDoorBack = this.matter.add.fromVertices(942 + 80, 1900 + 74 - 111, '8 130.5 1 190.5 544.5 190.5 508.5 142.5 422.5 62.5 309 0.5 217 0.5 115.5 56.5', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyDoorBack, bodyDoor, bodyLeftBottomTable, bodyLeftMiddleShell, bodyLeftTopShell, bodyLeftMiddleTable, bodyLeftTopBookshell, bodyRightBottomTable, bodyRightMiddleTable, bodyRightMiddleShell, bodyRightTopShell, bodyRightTopBookshell];

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
        this.fiverthKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'fiverthKey');
        this.fiverthKey.setScale(0.25);
        this.fiverthKey.setVisible(false);
        this.fiverthKey.setDepth(2);
        this.fiverthKey.setScrollFactor(0);
        this.fiverthKey.setAlpha(0);

        //Второй ключ
        this.clueKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'clueKey');
        this.clueKey.setScale(0.25);
        this.clueKey.setVisible(false);
        this.clueKey.setDepth(2);
        this.clueKey.setScrollFactor(0);
        this.clueKey.setAlpha(0);

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
            this.fiverthKey.setVisible(true);
            if (this.fold.indexOf(this.fiverthKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.fiverthKey.texture.key);
            }
        }
        else if (this.eventZone == LABEL_ID.CLUE_KEY) {
            this.clueKey.setVisible(true);
            if (this.fold.indexOf(this.clueKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.clueKey.texture.key);
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
        if (this.fiverthKey.visible) this.fiverthKey.setVisible(false);
        if (this.clueKey.visible) this.clueKey.setVisible(false);
        if (this.emptySign.visible) this.emptySign.setVisible(false);

        this.overlayBackground.setVisible(false);
        this.closeButton.setVisible(false);
    }

    itemInteract(context) {
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
        super.update();
    }
}
