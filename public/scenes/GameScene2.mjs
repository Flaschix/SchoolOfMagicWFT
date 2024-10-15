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

export class GameScene2 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE2);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map2', './assets/map/forest 2.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map2');

        if (this.mobileFlag) {
            createJoystick(this, 'joystickBase', 'joystickThumb', this.isDragging, 160, this.cameras.main.height - 140);
            createMobileXButton(this, 'touchButton', 'joystickBase', this.cameras.main.width - 150, this.cameras.main.height - 140, this.itemInteract);
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

        createAvatarDialog(this, this.enterNewSettingsInAvatarDialog, this.closeAvatarDialog, this.player.room, isMobile());
    }


    createMap(map) {
        this.map = this.add.image(0, 0, map).setOrigin(0, 0);
        this.matter.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createUnWalkedObjects() {
        const bodyLeftWall = this.matter.add.fromVertices(12 + 801, 96 + 1000, '1232.5 1858 1278 1968.5 0.5 1968.5 6 0.5 1601 0.5 1601 76.5 1500 76.5 1424.5 102 1386 128 1341 166 1341 217.5 1341 291.5 1363.5 342.5 1424.5 434 1407 451.5 1341 501.5 1248 520.5 1200 461.5 1100.5 501.5 1116.5 599 1068.5 629.5 966 701.5 905 790 1006 831.5 1006 859 966 899 966 924.5 940.5 939 940.5 993.5 905 1027.5 905 1068 884 1053 863.5 1086.5 863.5 1112.5 810.5 1141 756 1123.5 706 1068 666 1053 679 1009.5 639 968 639 915 595.5 870 595.5 819.5 571.5 780.5 554 701.5 595.5 663.5 764 599 764 546.5 725.5 520.5 554 520.5 456 461.5 342 461.5 178.5 520.5 215.5 546.5 274.5 567.5 286 639.5 237 701.5 286 729.5 312 819.5 312 958.5 376 1068 421.5 1207 237 1222 199 1269.5 119 1415 129 1488.5 106 1552.5 140.5 1583.5 155 1622.5 129 1786.5 222 1806 292.5 1878.5 421.5 1889.5 457.5 1858 488.5 1878.5 578 1930 658.5 1930 696 1878.5 731 1878.5 866 1930 901 1930 938.5 1930 970 1878.5 1059.5 1878.5 1099.5 1858 1232.5 1858', { isStatic: true }, true);
        const bodyRightWall = this.matter.add.fromVertices(1050 + 477, 556 + 796, '536.5 1468 599 1591.5 953 1591.5 953 0.5 453.5 0.5 453.5 47.5 535 63 645 63 656.5 83.5 631.5 113.5 645 164.5 656.5 240.5 631.5 240.5 579 264.5 579 328.5 502.5 344 421.5 425 382.5 479.5 347 547 238.5 535.5 238.5 591 204.5 630 150.5 676 123.5 750.5 84.5 814.5 84.5 855 66 940 106.5 980.5 55.5 1075.5 22 1136 1.5 1197 42 1207.5 22 1260 84.5 1305.5 171 1332.5 282.5 1292 320 1226 282.5 1197 320 1160 396 1150 421.5 1171.5 408 1226 470.5 1244.5 536.5 1226 590.5 1260 599 1319 577 1332.5 590.5 1361.5 658.5 1361.5 689 1387 675.5 1422.5 609.5 1410.5 536.5 1468', { isStatic: true }, true)
        const bodyGreen = this.matter.add.fromVertices(448 + 224, 1390 + 343.5, '1 203 24.5 123 58.5 85.5 120 40 173 0.5 254.5 0.5 329.5 22.5 372 55 426.5 103 447 160.5 447 239 414.5 271.5 414.5 298.5 391 353 329.5 377 273.5 385.5 229 426.5 173 426.5 120 402.5 81 334.5 24.5 298.5 1 203', { isStatic: true }, true)
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


        const bodyDoorBack = this.matter.add.fromVertices(1338 + 166.5, 1904 + 71.5, '1.5 21 56.5 142.5 331.5 142.5 258 1', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        // Создаем графику для подсветки
        const highlightGraphics = this.add.graphics();
        highlightGraphics.lineStyle(2, 0x06ff01, 1);

        const arrBodies = [bodyDoorBack];

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
    }

    createInputHandlers() {
        this.input.keyboard.on('keydown-X', () => {
            if (this.isInZone) {
                this.player.setVelocity(0);

                if (this.eventZone == LABEL_ID.DOOR_BACK_ID) {
                    this.moveBackRoom();
                    return;
                }

            }
        });
    }

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE, 440, 730);
    }

    itemInteract(context) {
        if (context.isInZone) {
            context.player.setVelocity(0);

            if (context.eventZone == LABEL_ID.DOOR_BACK_ID) {
                context.moveBackRoom();
                return;
            }

        }
    }

    update() {
        super.update();
    }
}

