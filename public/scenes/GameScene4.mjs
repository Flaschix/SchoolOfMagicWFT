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
        this.load.image('map4', './assets/map/forest 4.jpg');
    }

    create(data) {
        super.create(data);

        const { players } = data;

        // Добавляем карту
        this.createMap('map4');

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
        const bodyRightWall = this.matter.add.fromVertices(770 + 657.5, 600 + 890, '83 1689 2 1797.5 1278.5 1756.5 1313.5 0.5 1280.5 0.5 1213 0.5 1154.5 33.5 1063.5 89.5 947 152.5 916.5 239 930.5 292.5 961 344 961 404.5 961 467.5 961 537.5 984 603 947 659 947 703.5 916.5 764 890.5 792 890.5 811 916.5 885.5 862.5 885.5 804.5 988.5 778.5 1077 736.5 1168 778.5 1217 778.5 1264 832.5 1301 804.5 1317.5 715.5 1331.5 578 1357 578 1411 547.5 1446 596.5 1488 673.5 1488 736.5 1446 846.5 1411 916.5 1436.5 846.5 1488 778.5 1537 727.5 1602.5 638.5 1602.5 468 1553.5 428.5 1518.5 398 1469.5 335 1469.5 288.5 1469.5 272 1488 213.5 1469.5 171.5 1518.5 171.5 1572 132 1628 83 1689', { isStatic: true }, true)
        const bodyLeftWall = this.matter.add.fromVertices(749, 796, '457 1919 495 1977 0.5 1977 0.5 0.5 1928.5 0.5 1928.5 238 1870 233 1870 138.5 1630.5 74.5 1588 92 1503 154 1366.5 255 1217 379 1285.5 488 1336 547 1331 595 1336 639.5 1347.5 653 1347.5 701.5 1331 709 1307 709 1285.5 728.5 1285.5 753.5 1307 778.5 1289.5 795 1281.5 832.5 1281.5 878 1281.5 944 1271 984.5 1226.5 1059.5 1226.5 1090.5 1182 1163 1204 1192 1171.5 1209 1102 1192 997 1192 834.5 1241 693.5 1262.5 664.5 1247 675.5 1172.5 703.5 1134 703.5 1098 675.5 1074 683 999 675.5 965 693.5 937 688 893.5 638.5 878 643.5 802.5 658 750.5 658 669.5 696.5 664.5 727.5 627 732.5 586.5 688 527.5 688 472.5 688 388.5 680 294 657 179 617.5 86 560.5 53.5 501.5 53.5 422.5 119 337.5 210 278.5 281.5 284.5 326.5 324 415.5 384.5 463 422.5 496.5 384.5 535.5 384.5 586.5 331.5 641.5 331.5 675.5 415.5 719.5 415.5 931 369.5 984.5 369.5 1027.5 331.5 1090.5 331.5 1123.5 270 1163 270 1223 250.5 1241 242 1308 236 1385 195.5 1445 89 1467 16 1467 16 1637 53.5 1663 163.5 1719 241 1781 260 1844.5 393.5 1879.5 457 1919', { isStatic: true }, true)
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

        const bodyDoorLeft = this.matter.add.fromVertices(272 + 199.5, 122 + 192.5, '1 241.5 101.5 384 398 300 342 57 237 1', {
            label: `${LABEL_ID.DOOR_FORWARD_ID}`,
            isStatic: true,
            isSensor: true
        });

        const bodyDoorRight = this.matter.add.fromVertices(1418 + 216.5, 152.5 + 110.5, '2 139 287 220 432 151 432 57.5 184.5 1.5', {
            label: `${LABEL_ID.DOOR_FORWARD_ID_2}`,
            isStatic: true,
            isSensor: true
        });

        const bodyDoorBack = this.matter.add.fromVertices(388 + 211.5, 1820 + 114.5, '1.5 124.5 108 228 318 228 421.5 88 161.5 1', {
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
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE6, 824, 1850);
    }

    moveForwardRoomRight() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE7, 1624, 1950);
    }

    moveBackRoom() {
        this.isInZone = false;
        this.eventZone = null;
        this.mySocket.emitSwitchScene(CST.SCENE.GAMESCENE3, 180, 700);
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

