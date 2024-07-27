export function createUIBottom(self) {
    const uiContainer = self.add.dom(self.cameras.main.width / 2, self.cameras.main.height).createFromHTML(`
        <div style="text-align: center;background:#0F0920;height: 24px; width: 1280px">
        </div>
    `);

    uiContainer.setOrigin(0.5, 0.5);
    uiContainer.setScrollFactor(0);
}

export function createUITop(self) {
    const uiContainer = self.add.dom(self.cameras.main.width / 2, 0).createFromHTML(`
        <div style="text-align: center;background:#0F0920;height: 24px; width: 1280px">
        </div>
    `);

    uiContainer.setOrigin(0.5, 0.5);
    uiContainer.setScrollFactor(0);
}

export function createUIRight(self) {
    const uiContainer = self.add.dom(self.cameras.main.width, self.cameras.main.height / 2).createFromHTML(`
        <div style="text-align: center;background:#0F0920;height: 720px; width: 50px">
        </div>
    `);

    uiContainer.setOrigin(0.5, 0.5);
    uiContainer.setScrollFactor(0);
}

export function createUI(self, eventSettingsBtn, eventExitBtn) {

    const uiContainer = self.add.dom(50, self.cameras.main.height / 2).createFromHTML(`
            <div class="container">
    <img class="game-logo" src="./assets/icon/logo.png" alt="Company Logo">
    <div class="game-buttons">
        <input class="gamebutton" id="settingsButton" type="image" src="./assets/icon/settings.png" alt="Кнопка «input»">
        <input class="gamebutton" id="exitButton" type="image" src="./assets/icon/exit.png" alt="Кнопка «input»">
    </div>
</div>
    `);

    // Добавляем обработчик события для кнопки настроек
    const settingsButton = document.getElementById('settingsButton');
    const exitButton = document.getElementById('exitButton');

    settingsButton.addEventListener('click', () => {
        eventSettingsBtn(self);
    });
    exitButton.addEventListener('click', () => {
        eventExitBtn(self);
    });

    uiContainer.setOrigin(0.5, 0.5);
    uiContainer.setScrollFactor(0);
}

export function createExitMenu(self, eventLeaveBtn, eventCloseBtn) {
    self.exitContainer = self.add.dom(0, 0).createFromHTML(`
<div class="exit-container">
<input type="image" src="./assets/button/leave-space.png" alt="Leave space" class="exit-button" id="leave-space">
<input type="image" src="./assets/button/cancel-exit.png" alt="Close" class="exit-button" id="close-btn">
</div>
`);
    const leaveBtn = document.getElementById('leave-space');
    leaveBtn.addEventListener('click', () => {
        eventLeaveBtn(self);
    });


    const closeBtn = document.getElementById('close-btn');
    closeBtn.addEventListener('click', () => {
        eventCloseBtn(self);
    });

    self.exitContainer.setOrigin(2, 1);
    self.exitContainer.setVisible(false);
}

export function createAvatarDialog(self, eventConfirmBtn, eventCloseBtn) {
    self.avatarDialog = self.add.dom(0, 0).createFromHTML(`
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
    self.avatarDialog.setVisible(false);

    self.avatarDialog.setOrigin(0.5, 0.5);

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
        eventConfirmBtn(self, nameInput, nameError, imgCount);
    });

    const avatarDialogBack = document.getElementById('backBtn');
    avatarDialogBack.addEventListener('click', () => {
        eventCloseBtn(self);
    });

}

export const HEIGHT_PRESS_X = 90;

export const MAP_SETTINGS = {
    MAP_FULL1: 'mapFull1',
    MAP_FULL2: 'mapFull2',
    MAP_FULL3: 'mapFull3',
    MAP_FULL4: 'mapFull4',

    MAP_SCALE_4_3: 4 / 3,
    MAP_SCALE_2: 2
}