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


export class GameScene extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map', './assets/map/library_room_11.jpg');
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
        const bodyRightDownWall = this.matter.add.fromVertices(1350 + 290, 1722 + 124, '1.5 180 10 327.5 699 326.5 699 156 652.5 156 650.5 145.5 643 142.5 638.5 139 627.5 134 627.5 120.5 634.5 116.5 641 109 651.5 101.5 656.5 92 655.5 84 650.5 77.5 641 71 634.5 67 631.5 63.5 629 60 624 55 616.5 55 615 63.5 606 63.5 608.5 73 596 80.5 591.5 90.5 596 102 619.5 120.5 619.5 134 590 137 585 142.5 579 168 507 168 423.5 164 372 168 110 164 104 178.5 98.5 177 96 172 93 168 91.5 162.5 87.5 150.5 89.5 145 89.5 133 85 124 68 124 57.5 121.5 55.5 100 55.5 89.5 62 89.5 72 84 91.5 70 101.5 51 101.5 43.5 96 36.5 80.5 25.5 62 22.5 59.5 18.5 52.5 12 49 1 43.5 1 42 12 31 13.5 15 13.5 13.5 25.5 1.5 34 5.5 51 18 75.5 40.5 89.5 43.5 118 40.5 121.5 25.5 127 25.5 140 11.5 140 10 149 1.5 166.5', { isStatic: true }, true)
        const bodyLeftDownWall = this.matter.add.fromVertices(1 + 400, 1712 + 130, '702 164 693 326 691.5 336 1 336 1 171 45 171 46 164.5 46 157.5 49 152 67.5 146.5 67.5 133.5 57.5 128 46 120 39.5 110 38.5 99 44 91.5 57.5 87.5 60 80.5 69.5 72.5 91 78 98 85.5 104.5 91.5 106.5 103 102.5 114.5 77 132 78 144.5 83.5 144.5 114.5 149 118.5 174 236 177.5 589.5 173 598.5 190 614 190 621.5 183.5 621.5 173 618 158 625.5 151 621.5 140.5 625.5 135.5 647 135.5 647 101.5 637.5 92.5 625.5 81.5 610.5 66 603.5 41.5 610.5 34 610.5 24.5 618 24.5 625.5 18.5 637.5 5.5 662.5 1 679.5 1 688 11 696.5 41.5 702 54.5 696.5 77 662.5 97.5 662.5 132 679.5 132 693 151', { isStatic: true }, true)
        const bodyMainWall = this.matter.add.fromVertices(944, 915, '106 1810.5 9 1882.5 1 1882.5 1 1 2048.5 1 2048.5 1887 2002.5 1887 1943 1833.5 1934 1781 1887 1766 1859 1733 1859 1650.5 1871 1622 1859 1574 1910 1559 1910 1517.5 1887 1483.5 1887 1438 1934 1425 1934 1388 1934 1369.5 1934 1336.5 1921 1311.5 1921 1257 1903.5 1239.5 1910 1162.5 1941.5 1162.5 1941.5 1128.5 1910 1113 1903.5 1085 1921 1054.5 1952.5 1041.5 1941.5 982.5 1952.5 847.5 1934 837.5 1910 847.5 1846 837.5 1827.5 817 1827.5 786.5 1846 770 1846 449.5 1768.5 449.5 1768.5 407 1576.5 407 1571 449.5 1507 449.5 1507 748 1520 763.5 1525.5 817 1493 847.5 1412 837.5 1306.5 837.5 1206 829 1206 786.5 1233.5 763.5 1216 721 1179 732 1136.5 703.5 1142 682 1110.5 675 1110.5 659 1110.5 473.5 942.5 473.5 942.5 667.5 918.5 682 918.5 703.5 880.5 732 845.5 721 821.5 715.5 814 798.5 684.5 829 642 829 530.5 829 522 816 530.5 786.5 551.5 763.5 551.5 459.5 480.5 459.5 474 421.5 280 421.5 280 459.5 211.5 459.5 211.5 763.5 217 776.5 211.5 829 123 829 136.5 776.5 123 763.5 102.5 853 102.5 936.5 108 955.5 108 980.5 102.5 1004.5 102.5 1044.5 115.5 1052 143 1065.5 150.5 1096 123 1155.5 129.5 1181 150.5 1199.5 143 1249.5 129.5 1258 136.5 1305 115.5 1323.5 115.5 1421.5 163.5 1439 163.5 1475 136.5 1489 106 1592.5', { isStatic: true }, true)
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
        const bodyTableTopLeft = this.matter.add.fromVertices(465, 930, '458.5 105.5 24 105.5 1.5 66.5 6 24.5 43.5 0.5 424.5 0.5 483.5 43.5 483.5 77.5', { label: '1', isStatic: true });
        const bodyBookshellRightDown2 = this.matter.add.fromVertices(1536 + 124, 1671 + 90, '244.5 1 0.5 1 0.5 184 244.5 184', { label: '1', isStatic: true })
        const bodyBookshellRightDown1 = this.matter.add.fromVertices(1536 + 118, 1470 + 74, '235 1 1 1 1 148 235 148', { label: '1', isStatic: true })
        const bodyTableMiddleRight = this.matter.add.fromVertices(1285 + 84, 1333 + 160, '12.5 1 1 28.5 1 319 9.5 330.5 162.5 325.5 176 245 169.5 21.5 157 1', { label: '1', isStatic: true })
        const bodyTableTopRight = this.matter.add.fromVertices(1614 + 70, 780 + 45, '136.5 1 1 1 1 85 145 76.2093', { label: '1', isStatic: true })
        const bodyBookshellRightTop = this.matter.add.fromVertices(1509 + 162, 416 + 150, `1 272 1 34 63 28 258 28 332 28 332 272`, { label: `${LABEL_ID.FIRST_KEY}`, isStatic: true })
        const bodyBookshellLeftTop = this.matter.add.fromVertices(210 + 170, 416 + 165, '1 272 1 34 63 28 258 28 332 28 332 272', { label: '1', isStatic: true })
        const bodyTableMiddleLeft = this.matter.add.fromVertices(154 + 55, 1090 + 98, '95 0.5 17 0.5 0.5 35.5 3.5 188.5 110 188.5 110 42.5', { label: '1', isStatic: true })
        const bodyTableMiddleLeft2 = this.matter.add.fromVertices(625 + 80, 1330 + 165, '1 327 163.5 327 169.5 163.5 160 1 79 1 12 1 1 17.5', { label: '1', isStatic: true })
        const bodyBookshellLeftDown2 = this.matter.add.fromVertices(283 + 116, 1672 + 90, '231 1 1 1 1 171 231 171', { label: '2', isStatic: true })
        const bodyBookshellLeftDown1 = this.matter.add.fromVertices(279 + 116, 1467 + 70, '232 1 1 1 1 152 232 152', { label: `${LABEL_ID.SECOND_KEY}`, isStatic: true })
        const bodyDoor = this.matter.add.fromVertices(942 + 86, 483 + 90, '167.5 0.5 1 0.5 1 176 167.5 176', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
        })

        this.matterCollision.addOnCollideStart({
            objectA: this.player,
            objectB: [bodyDoor, bodyTableTopLeft, bodyBookshellRightDown2, bodyBookshellRightDown1, bodyTableMiddleRight, bodyTableTopRight, bodyBookshellRightTop, bodyBookshellLeftTop, bodyTableMiddleLeft, bodyTableMiddleLeft2, bodyBookshellLeftDown2, bodyBookshellLeftDown1],
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
            objectB: [bodyDoor, bodyTableTopLeft, bodyBookshellRightDown2, bodyBookshellRightDown1, bodyTableMiddleRight, bodyTableTopRight, bodyBookshellRightTop, bodyBookshellLeftTop, bodyTableMiddleLeft, bodyTableMiddleLeft2, bodyBookshellLeftDown2, bodyBookshellLeftDown1],
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
        this.firstKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'firstKey');
        this.firstKey.setScale(0.5);
        this.firstKey.setVisible(false);
        this.firstKey.setDepth(2);
        this.firstKey.setScrollFactor(0);
        this.firstKey.setAlpha(0);

        this.textA = this.add.text(250, this.cameras.main.height / 2, decryptN('69'), { font: "normal 60px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
        this.textA.setVisible(false);
        this.textA.setAlpha(0);

        //Второй ключ
        this.secondKey = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 10, 'secondKey');
        this.secondKey.setScale(0.5);
        this.secondKey.setVisible(false);
        this.secondKey.setDepth(2);
        this.secondKey.setScrollFactor(0);
        this.secondKey.setAlpha(0);

        this.textB = this.add.text(250 * 1.7, this.cameras.main.height / 2, decryptN('56'), { font: "normal 60px MyCustomFont", fill: '#000000', align: 'center' }).setScrollFactor(0).setDepth(2);
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
        this.closeButton.setAlpha(0); // Начальное значение прозрачности

        this.closeButton.on('pointerdown', () => {
            this.isOverlayVisible = false;
            this.tweens.add({
                targets: [this.closeButton, this.overlayBackground, this.emptySign, this.firstKey, this.secondKey, this.textB, this.textA],
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
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.firstKey, this.secondKey, this.textB, this.textA],
                        alpha: 1,
                        duration: 500
                    });
                }
                else {
                    this.tweens.add({
                        targets: [this.closeButton, this.overlayBackground, this.emptySign, this.firstKey, this.secondKey, this.textB, this.textA],
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 1024, 1770);
    }

    showOverlay() {
        this.isOverlayVisible = true

        if (this.eventZone == LABEL_ID.FIRST_KEY) {
            this.firstKey.setVisible(true);
            this.textA.setVisible(true)
            if (this.fold.indexOf(this.firstKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.firstKey.texture.key, this.textA.text);
            }

        }
        else if (this.eventZone == LABEL_ID.SECOND_KEY) {
            this.secondKey.setVisible(true);
            this.textB.setVisible(true)
            if (this.fold.indexOf(this.secondKey.texture.key) == -1) {
                this.mySocket.emitAddNewImg(this.secondKey.texture.key);
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
        if (this.secondKey.visible) {
            this.secondKey.setVisible(false);
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

            if (!context.isOverlayVisible) {

                context.showOverlay();

                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.firstKey, context.secondKey, context.textA, context.textB],
                    alpha: 1,
                    duration: 500
                });
            }
            else {
                context.tweens.add({
                    targets: [context.emptySign, context.overlayBackground, context.closeButton, context.firstKey, context.secondKey, context.textA, context.textB],
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

