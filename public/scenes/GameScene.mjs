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

export class GameScene extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map', './assets/map/forest 1.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map');

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
        const bodyLeftWall = this.matter.add.fromVertices(812, 40 + 999.5, '629.5 1821.5 765 1945 1220 1998 0.5 1998 0.5 0.5 1984 0.5 1984 231 1834 150 1756.5 150 1618 231 1595 288.5 1618 398 1557.5 513.5 1474 698 1419 825 1315 920 1024 1038 796.5 1107.5 669.5 1107.5 586 882.5 502.5 654.5 424.5 458.5 165 513.5 165 554 254.5 721 292 882.5 375.5 1107.5 375.5 1214 292 1153.5 165 1199.5 110.5 1271.5 145 1320.5 199.5 1320.5 292 1320.5 329.5 1398.5 225.5 1574.5 329.5 1689.5 444.5 1666.5 502.5 1821.5 629.5 1821.5', { isStatic: true }, true);
        const bodyRightWall = this.matter.add.fromVertices(1280 + 442, 630 + 762, '531.5 1451 364 1523 883 1523 883 1 744.5 82 566 335.5 566 451 612 523 597.5 603.5 701.5 649.5 597.5 698.5 566 785 664 828.5 646.5 906.5 494 958 188.5 828.5 188.5 906.5 32.5 958 1 1197.5 133.5 1212 226 1122.5 410 1243.5 517 1243.5 531.5 1341.5 664 1341.5 664 1434 531.5 1451', { isStatic: true }, true)
        const bodyMiddleWall = this.matter.add.fromVertices(615 + 145, 1470 + 149.5, '79 298 1 182.5 79 64.5 165.5 1 289.5 32.5 289.5 214.5 185.5 254.5 79 298', { isStatic: true }, true)
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


        const bodyDoorRight = this.matter.add.fromVertices(1668 + 187, 187.5 + 187.5, '1 94 21.5 264 234.5 373.5 373 307.5 373 74 185.5 1.5 1 94', {
            label: `${LABEL_ID.DOOR_FORWARD_ID_2}`,
            isStatic: true,
            isSensor: true
        })

        const bodyDoorLeft = this.matter.add.fromVertices(215.5 + 168.5, 490.5 + 131, '93.5 261 1.5 76.5 252 1.5 335.5 206', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyDoorLeft, bodyDoorRight]

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

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                    this.moveForwardRoomLeft();
                    return;
                }

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID_2) {
                    this.moveForwardRoomRight();
                    return;
                }
            }
        });
    }

    moveForwardRoomLeft() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE2, 1424, 1840);
    }

    moveForwardRoomRight() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE3, 1070, 1710);
    }

    itemInteract(context) {
        if (context.isInZone) {
            context.player.setVelocity(0);

            if (context.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                context.moveForwardRoomLeft();
                return;
            }

            if (context.eventZone == LABEL_ID.DOOR_FORWARD_ID_2) {
                context.moveForwardRoomRight();
                return;
            }
        }
    }

    update() {
        super.update();
    }
}

