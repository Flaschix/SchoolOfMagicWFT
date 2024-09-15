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

export class GameScene3 extends BaseScene {
    constructor() {
        super(CST.SCENE.GAMESCENE3);
    }

    preload() {
        super.preload();

        //map
        this.load.image('map3', './assets/map/forest 3.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map3');

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
        const bodyRightWall = this.matter.add.fromVertices(1235.5 + 380, 236 + 911.5, '0.5 1727.5 43.5 1822 759.5 1822 759.5 1 389.5 1 361 48.5 330 103 330 162.5 292.5 186 292.5 243 275.5 276 292.5 319 313.5 359 330 406.5 361 435 422.5 406.5 449 492 389.5 492 313.5 506 252 572.5 252 603.5 275.5 662.5 330 679.5 275.5 800 349 971 275.5 1013.5 292.5 1054 330 1127.5 349 1179.5 401.5 1227 422.5 1269.5 401.5 1348 349 1397.5 252 1431 140.5 1431 43.5 1431 0.5 1445 0.5 1533 0.5 1637 0.5 1727.5', { isStatic: true }, true)
        const bodyLeftWall = this.matter.add.fromVertices(600, 982, '962 1562.5 942 1812 0.5 1794.5 0.5 0.5 1217 0.5 1198 69 1233.5 111.5 1281 199.5 1269 244.5 1262 346.5 1307 427 1262 555 1179 665 1101 768.5 1101 809 1155.5 844.5 1162.5 944 1262 971.5 1335.5 1031.5 1307 1129 1281 1227 1141 1247.5 962 1247.5 899.5 1197.5 787 1152.5 662 1069.5 617 998.5 453.5 915.5 403.5 855 373 740 318.5 569.5 252 466 202 377.5 233 346.5 278.5 294.5 349 294.5 439.5 235 403.5 173.5 304 111.5 221 90.5 202 90.5 176 126 98 213.5 17 199.5 17 415 31.5 466 57 597 111 665 153.5 829.5 202 855 278.5 971.5 403.5 1096.5 426.5 1227 568.5 1301 633.5 1389 787 1448.5 920.5 1477 962 1562.5', { isStatic: true }, true)
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

        const bodyDoorLeft = this.matter.add.fromVertices(140, 290 + 175.5, '168.5 335.5 0.5 349.5 0.5 84 147.5 1 292 143', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
            isSensor: true
        });

        const bodyDoorRight = this.matter.add.fromVertices(1204.5 + 236, 12.5 + 200, '1 280 77 398.5 384.5 369.5 470.5 0.5 134 0.5', {
            label: `${LABEL_ID.DOOR_FORWARD_ID_2}`,
            isStatic: true,
        });

        const bodyDoorBack = this.matter.add.fromVertices(932.5 + 183, 1742 + 154.5, '26 1 1.5 308.5 365 308.5 327.5 1', {
            label: `${LABEL_ID.DOOR_BACK_ID}`,
            isStatic: true,
            isSensor: true
        })

        const arrBodies = [bodyDoorBack, bodyDoorRight, bodyDoorLeft];

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
                console.log(this.eventZone);

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID) {
                    this.moveForwardRoomLeft();
                    return;
                }

                if (this.eventZone == LABEL_ID.DOOR_FORWARD_ID_2) {
                    this.moveForwardRoomRight();
                    return;
                }

                if (this.eventZone == LABEL_ID.DOOR_BACK_ID) {
                    this.moveBackRoom();
                    return;
                }

            }
        });
    }

    moveForwardRoomLeft() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE4, 424, 1850);
    }

    moveForwardRoomRight() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE5, 1024, 1850);
    }

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE, 1715, 500);
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

