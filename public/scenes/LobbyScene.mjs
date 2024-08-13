import { CST } from "../CST.mjs";
import { socket } from "../CST.mjs";

import { isMobile } from "../share/UICreator.mjs";
import { createAvatarDialog } from "../share/UICreator.mjs";
import { createExitMenu } from "../share/UICreator.mjs";

export class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: CST.SCENE.LOBBYSCENE });
        this.code = null;
        this.avatarDialog = null;
        this.welcomeContainer = null;
        this.joinRoomContainer = null;
        this.newSpaceContainer = null;
        this.creatCodeText = null;
        this.copyBtn = null;

        this.mobile = isMobile();
    }

    preload() {

        // Создание спрайта и запуск анимации
        this.loadingSprite = this.add.sprite(1280 / 2, 720 / 2, 'loading'); // Центрирование спрайта
        this.loadingSprite.setScale(0.3, 0.3);
        this.loadingSprite.play('loadingAnimation');


        this.load.image('backgroundMenu', './assets/background/background-menu.png');

        this.load.image('pressX', 'assets/icon/pressX.png');
        this.load.image('closeIcon', 'assets/icon/closeIcon.png');

        this.load.image('overlayBackground', 'assets/overlay/overlayBackground.png');

        this.load.image('joystickBase', 'assets/joystick/joystick-back.png');
        this.load.image('joystickThumb', 'assets/joystick/thrumb-btn.png');
        this.load.image('touchButton', 'assets/joystick/touch-button.png');
        this.load.image('exitMobile', 'assets/button/exitMobile.png');
        this.load.image('settingsMobile', 'assets/button/settingsMobile.png');

        //characters
        this.load.spritesheet('character1', './assets/characterMap/character1.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('character2', './assets/characterMap/character2.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('character3', './assets/characterMap/character3.png', { frameWidth: 29, frameHeight: 45 });
        this.load.spritesheet('character4', './assets/characterMap/character4.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('character5', './assets/characterMap/character5.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('character6', './assets/characterMap/character6.png', { frameWidth: 48, frameHeight: 64 });
    }

    createWelcomeContainer() {
        this.welcomeContainer = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(`
    <div class="container-welcome">
        <h1>Welcome!</h1>
        <input type="image" src="./assets/button/join.png" alt="ConnectToSpace" class="connect-button" id="connect-to-space">
        <div class="or-text">or</div>
        <input type="image" src="./assets/button/create-room.png" alt="CreateToSpace" class="connect-button" id="create-space">
    </div>
        `);
        this.welcomeContainer.setOrigin(1, 0.7);

        const connectToSpaceBtn = document.getElementById('connect-to-space');
        connectToSpaceBtn.addEventListener('click', () => {
            console.log("connect");
            this.joinRoomContainer.setVisible(true);
            this.welcomeContainer.setVisible(false);
        });

        const createSpace = document.getElementById('create-space');
        createSpace.addEventListener('click', () => {
            socket.emit('createRoom');
            console.log("create");
        });
    }

    createJoinRoomContainer() {
        this.joinRoomContainer = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(`
    <div class="joinRoomContainer">
        <div id="joinRoomDialog">
            <h2 id="enterCodeTitle">Enter code a room</h2>
            <div id="codeInputs">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
                <input class="connect-space-input" type="text" maxlength="1">
            </div>
            <input id="join-room-connect" class="connect-space-button" type="image" src="./assets/button/join2.png" alt="Connect">
            <input id="join-room-cancel" class="connect-space-button" type="image" src="./assets/button/cancel.png" alt="Cancel">
        </div>
    </div>
                `);

        this.joinRoomContainer.setOrigin(0.5, 0.5);
        const inputsContainer = document.getElementById('codeInputs')
        const titleContainer = document.getElementById('enterCodeTitle')

        const inputs = document.querySelectorAll('#codeInputs input');

        let correctFlag = true;

        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
        });

        const joinRoomConnect = document.getElementById('join-room-connect');
        joinRoomConnect.addEventListener('click', () => {
            if (correctFlag) {
                let code = '';

                inputs.forEach(input => {
                    code += input.value;
                });
                console.log(code);
                socket.emit('checkRoom', code);
            } else {
                inputsContainer.style.display = 'flex';
                titleContainer.innerHTML = 'Enter code';
                titleContainer.style.color = '#F2F0FF';
                joinRoomConnect.src = './assets/button/join2.png';
                correctFlag = true
            }

        });

        const joinRoomCancel = document.getElementById('join-room-cancel');
        joinRoomCancel.addEventListener('click', () => {
            this.joinRoomContainer.setVisible(false);
            this.welcomeContainer.setVisible(true);
        });

        this.joinRoomContainer.setVisible(false);

        socket.on('roomNotFound', () => {
            inputs.forEach(input => {
                input.value = "";
            });

            correctFlag = false;
            inputsContainer.style.display = 'none';
            titleContainer.innerHTML = 'Incorrect code';
            titleContainer.style.color = 'red';
            joinRoomConnect.src = './assets/button/try-again.png';
            correctFlag = false
        });
    }

    createAvatarDialog() {
        this.avatarDialog = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(`
	<div id="avatarDialog">
        <h2>Choose avatar</h2>
        <div id="avatarContainer">
            <img src="./assets/character/man1.png" class="avatar" data-index="0">
            <img src="./assets/character/man2.png" class="avatar" data-index="1">
            <img src="./assets/character/man3.png" class="avatar" data-index="2">
            <img src="./assets/character/woman1.png" class="avatar" data-index="3">
            <img src="./assets/character/woman2.png" class="avatar" data-index="4">
            <img src="./assets/character/woman3.png" class="avatar" data-index="5">
        </div>
        <div id="usernameContainer">
            <label for="usernameInput">Name</label>
            <div id="inputContainer">
                <input type="text" id="usernameInput" placeholder="Enter your name">
                <img src="./assets/icon/pen.png" id="penIcon">
            </div>
        </div>
        <label id="incorrectName">Incorrect name
*the name must be 1-12 characters</label>
        <input type="image" src="./assets/button/join.png" id="joinBtn">
        <input type="image" src="./assets/button/back.png" id="backBtn">
    </div>
            `);
        this.avatarDialog.setVisible(false);

        this.avatarDialog.setOrigin(0.5, 0.6);

        const avatars = document.querySelectorAll('#avatarContainer .avatar');
        let selectedAvatar = avatars[0]; // По умолчанию выделяем первый аватар
        let imgCount = 0;

        // Добавляем класс выделения первому аватару
        selectedAvatar.classList.add('selected');

        avatars.forEach(avatar => {
            avatar.addEventListener('click', function () {
                // Убираем класс выделения с предыдущего аватара
                selectedAvatar.classList.remove('selected');
                // Добавляем класс выделения новому аватару
                avatar.classList.add('selected');
                // Обновляем ссылку на текущий выделенный аватар
                selectedAvatar = avatar;
                imgCount = Number(avatar.dataset.index);
                console.log(imgCount);
            });
        });

        const nameInput = document.getElementById('usernameInput');
        const nameError = document.getElementById('incorrectName');

        const avatarDialogJoin = document.getElementById('joinBtn');
        avatarDialogJoin.addEventListener('click', () => {
            const username = nameInput.value;
            if (username.length < 1 || username.length > 12) {
                nameError.style.visibility = "visible";
            }
            else {
                console.log(username);

                let roomCode = this.code;
                socket.emit('joinRoom', { roomCode, avatar: imgCount + 1, username });
            }
        });

        const avatarDialogBack = document.getElementById('backBtn');
        avatarDialogBack.addEventListener('click', () => {
            this.avatarDialog.setVisible(false);
            this.welcomeContainer.setVisible(true);
        });

    }

    avatartFinishEditing(self, nameInput, nameError, imgCount) {
        const username = nameInput.value;
        if (username.length < 1 || username.length > 12) {
            nameError.style.visibility = "visible";
        }
        else {
            console.log(username);

            let roomCode = self.code;
            socket.emit('joinRoom', { roomCode, avatar: imgCount + 1, username });
        }
    }
    closeAvatarDialog(self) {
        self.avatarDialog.setVisible(false);
        self.welcomeContainer.setVisible(true);
    }

    createNewSpaceContainer() {
        this.newSpaceContainer = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(`
	<div id="createRoomDialogContainer">
    <div id="createRoomDialog">
        <h2 style="text-align: center;">Your space</h2>
        <div class="code-display-container">
            <div class="space-number-label">space number</div>
            <div class="code-display" id="roomCode">ROOM_CODE_HERE</div>
            <img src="./assets/button/copy.png" class="copy-btn" id="copyBtn" alt="Copy">
        </div>
        <input type="image" src="./assets/button/connect.png" class="centered-btn" id="connectBtn" alt="Connect">
        <input type="image" src="./assets/button/cancel.png" class="centered-btn" id="cancelBtn" alt="Cancel">
    </div>
    </div>
        `);

        this.newSpaceContainer.setOrigin(0.5, 0.5);

        this.newSpaceContainer.setVisible(false);

        this.creatCodeText = document.getElementById('roomCode');

        this.copyBtn = document.getElementById('copyBtn')

        this.copyBtn.onclick = () => {
            navigator.clipboard.writeText(this.code).then(() => {
                this.copyBtn.src = './assets/button/copied.png';
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        };

        const connectBtn = document.getElementById('connectBtn')
        connectBtn.addEventListener('click', () => {
            this.newSpaceContainer.setVisible(false);
            if (!this.mobile) this.avatarDialog.setOrigin(0.5, 0.6);
            this.avatarDialog.setVisible(true);
        });

        const cancelBtn = document.getElementById('cancelBtn')
        cancelBtn.addEventListener('click', () => {
            this.newSpaceContainer.setVisible(false);
            this.welcomeContainer.setVisible(true);
        });
    }

    create() {
        this.loadingSprite.stop();
        this.loadingSprite.destroy();

        // Добавляем фон
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundMenu').setDisplaySize(this.scale.width, this.scale.height);

        createExitMenu(this, {}, {}, this.mobileFlag);

        this.createWelcomeContainer();

        this.createJoinRoomContainer();

        // this.createAvatarDialog();
        createAvatarDialog(this, this.avatartFinishEditing, this.closeAvatarDialog, null, isMobile(), 'join3');

        this.createNewSpaceContainer();

        socket.on('roomExists', (roomCode) => {
            this.code = roomCode;
            this.joinRoomContainer.setVisible(false);
            if (!this.mobile) this.avatarDialog.setOrigin(0.5, 0.6);
            this.avatarDialog.setVisible(true);
        });

        socket.on('currentPlayers', (players) => {
            console.log("Received current players:", players);

            this.avatarDialog.destroy();
            this.welcomeContainer.destroy();
            this.joinRoomContainer.destroy();
            this.newSpaceContainer.destroy();
            this.exitContainer.destroy();
            this.scene.start(CST.SCENE.GAMESCENE, { players });
        });

        socket.on('roomCreated', (roomCode) => {
            this.welcomeContainer.setVisible(false);
            this.newSpaceContainer.setVisible(true);
            this.copyBtn.src = './assets/button/copy.png';
            this.code = roomCode;
            this.creatCodeText.textContent = roomCode;
        });

        this.createAnimations();

        socket.on('connect', () => {
            console.log('Connected to server');
        });
    }

    createAnimations() {
        for (let i = 1; i <= 6; i++) {
            this.anims.create({
                key: `walk_down${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: `walk_left${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: `walk_right${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: `walk_up${i}`,
                frames: this.anims.generateFrameNumbers(`character${i}`, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }
}