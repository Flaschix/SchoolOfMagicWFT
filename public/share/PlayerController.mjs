export class PlayersController {

    createMainPlayer(self, playerInfo) {
        const newPlayer = self.matter.add.sprite(playerInfo.x, playerInfo.y, `character${playerInfo.character}`);
        newPlayer.setScale(1.3);
        newPlayer.setDepth(1);
        newPlayer.character = playerInfo.character;
        newPlayer.name = playerInfo.name;
        newPlayer.room = playerInfo.room;
        newPlayer.setBounce(0); // настройка упругости
        newPlayer.setFrictionAir(0); // настройка сопротивления воздуха


        const colliderWidth = 22;
        const colliderHeight = 25;
        newPlayer.setBody({
            type: 'circle',
            width: colliderWidth,
            height: colliderHeight
        });
        newPlayer.setOrigin(0.5, 0.7);


        // Добавляем текст с именем игрока
        newPlayer.nameText = self.add.text(newPlayer.x, newPlayer.y - PlayersController.HEIGHT_NAME, newPlayer.name, { fontSize: '17px', fill: '#fff' }).setOrigin(0.5);
        newPlayer.setFixedRotation();
        ///////////////////////////////////

        return newPlayer;
    }

    updateMainPlayerPosition(player, cursors) {
        player.setVelocity(0);
        if (cursors.left.isDown) {
            player.setVelocityX(-5);
            player.anims.play(`walk_left${player.character}`, true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(5);
            player.anims.play(`walk_right${player.character}`, true);
        } else if (cursors.up.isDown) {
            player.setVelocityY(-5);
            player.anims.play(`walk_up${player.character}`, true);
        } else if (cursors.down.isDown) {
            player.setVelocityY(5);
            player.anims.play(`walk_down${player.character}`, true);
        } else {
            player.anims.stop();
        }

        //Рисуем ник игрока
        player.nameText.setPosition(player.x, player.y - PlayersController.HEIGHT_NAME);
    }

    updateMainPlayerPositionJoystick(player, joystickThumb, joystickBase) {
        player.setVelocity(0);
        if (joystickThumb.x < joystickBase.x - 10) {
            player.setVelocityX(-5);
            player.anims.play(`walk_left${player.character}`, true);
        } else if (joystickThumb.x > joystickBase.x + 10) {
            player.setVelocityX(5);
            player.anims.play(`walk_right${player.character}`, true);
        } else if (joystickThumb.y < joystickBase.y - 10) {
            player.setVelocityY(-5);
            player.anims.play(`walk_up${player.character}`, true);
        } else if (joystickThumb.y > joystickBase.y + 10) {
            player.setVelocityY(5);
            player.anims.play(`walk_down${player.character}`, true);
        } else {
            player.anims.stop();
        }

        //Рисуем ник игрока
        player.nameText.setPosition(player.x, player.y - PlayersController.HEIGHT_NAME);
    }



    createOtherPlayer(self, playerInfo, otherPlayers) {
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, `character${playerInfo.character}`);
        otherPlayer.setScale(1.3);
        otherPlayer.setOrigin(0.5, 0.7);

        otherPlayer.character = playerInfo.character;
        otherPlayer.name = playerInfo.name;

        // Добавляем текст с именем игрока
        otherPlayer.nameText = self.add.text(otherPlayer.x, otherPlayer.y - PlayersController.HEIGHT_NAME, otherPlayer.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);

        otherPlayers[playerInfo.id] = otherPlayer;
    }

    updateAnimOtherPlayer(playerSprite, playerInfo) {
        if (playerInfo.velocityX < 0) {
            playerSprite.anims.play(`walk_left${playerSprite.character}`, true);
        } else if (playerInfo.velocityX > 0) {
            playerSprite.anims.play(`walk_right${playerSprite.character}`, true);
        } else if (playerInfo.velocityY < 0) {
            playerSprite.anims.play(`walk_up${playerSprite.character}`, true);
        } else if (playerInfo.velocityY > 0) {
            playerSprite.anims.play(`walk_down${playerSprite.character}`, true);
        } else {
            playerSprite.anims.stop();
        }

        // Обновляем позицию текста с именем
        playerSprite.nameText.setPosition(playerSprite.x, playerSprite.y - PlayersController.HEIGHT_NAME);
    }

    static HEIGHT_NAME = 56;
}

