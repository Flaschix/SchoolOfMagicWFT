const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL // Укажите правильный адрес и порт
});

redisClient.connect().catch(console.error);

redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

const rooms = {};

function generateRoomCode(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', async () => {
        console.log('createRoom');
        // let preCode;
        // let check

        // do {
        //     preCode = 
        //     check = await redisClient.get(preCode);
        // } while (check != null)

        const roomCode = `${generateRoomCode(100000, 999999)}`;
        console.log(roomCode);
        const roomId = uuidv4();

        try {
            console.log('cheack 1');
            await redisClient.set(roomCode, roomId, { EX: 400 }); // Устанавливаем срок действия 24 часа 86400
            console.log('cheack 2');
            rooms[roomId] = { levels: {} };
            console.log('cheack 3');
            socket.join(roomId);
            console.log('cheack 4');
            socket.emit('roomCreated', roomCode);
            console.log(`Room created with code: ${roomCode}`);
        } catch (err) {
            console.error('Error creating room:', err);
        }
    });

    socket.on('checkRoom', async (roomCode) => {
        try {
            const roomId = await redisClient.get(roomCode);
            if (!roomId) {
                socket.emit('roomNotFound');
                return;
            } else {
                socket.emit('roomExists', roomCode);
                return;
            }
        } catch (err) {
            console.error('Error checking room:', err);
            socket.emit('error', 'An error occurred');
        }
    });

    socket.on('joinRoom', async ({ roomCode, avatar, username }) => {
        try {
            const roomId = await redisClient.get(roomCode);
            if (!roomId) {
                socket.emit('error', 'Room not found');
                return;
            }

            if (!rooms[roomId]) {
                rooms[roomId] = { levels: {} };
            }

            if (!rooms[roomId].levels['GameScene']) {
                rooms[roomId].levels['GameScene'] = {};
            }

            // socket.join(roomId);
            socket.roomId = roomId;
            socket.currentLevel = 'GameScene';

            socket.join(`${roomId}:${socket.currentLevel}`);

            rooms[roomId].levels[socket.currentLevel][socket.id] = { id: socket.id, x: 1024, y: 1024, character: avatar, name: username };

            // Отправляем информацию о текущих игроках новому игроку
            socket.emit('currentPlayers', rooms[roomId].levels[socket.currentLevel]);

            // Уведомляем других игроков о новом игроке
            socket.to(`${roomId}:${socket.currentLevel}`).emit(`newPlayer:${socket.currentLevel}`, rooms[roomId].levels[socket.currentLevel][socket.id]);

            socket.on(`disconnect`, () => {
                console.log('Client disconnected');
                if (rooms[roomId]) {
                    delete rooms[roomId].levels[socket.currentLevel][socket.id];
                    io.to(`${roomId}:${socket.currentLevel}`).emit('playerDisconnected', socket.id);
                }
            });

            socket.on(`playerMovement:${socket.currentLevel}`, (movementData) => {
                if (rooms[roomId].levels[socket.currentLevel][socket.id]) {
                    rooms[roomId].levels[socket.currentLevel][socket.id].x = movementData.x;
                    rooms[roomId].levels[socket.currentLevel][socket.id].y = movementData.y;
                    rooms[roomId].levels[socket.currentLevel][socket.id].velocityX = movementData.velocityX;
                    rooms[roomId].levels[socket.currentLevel][socket.id].velocityY = movementData.velocityY;
                    io.to(`${roomId}:${socket.currentLevel}`).emit(`playerMoved:${socket.currentLevel}`, { id: socket.id, ...movementData });
                }
            });

            socket.on('switchScene', (newScene, posX, posY) => {
                let avatarCur = rooms[roomId].levels[socket.currentLevel][socket.id].character;
                let usernameCur = rooms[roomId].levels[socket.currentLevel][socket.id].name;
                //выход с текущего уровня
                if (rooms[roomId].levels[socket.currentLevel]) {
                    delete rooms[roomId].levels[socket.currentLevel][socket.id];
                    io.to(`${roomId}:${socket.currentLevel}`).emit('playerDisconnected', socket.id);
                    socket.leave(`${roomId}:${socket.currentLevel}`);
                }

                socket.removeAllListeners(`playerMovement:${socket.currentLevel}`);
                socket.currentLevel = newScene;

                if (!rooms[roomId].levels[newScene]) {
                    rooms[roomId].levels[newScene] = {};
                }

                rooms[roomId].levels[newScene][socket.id] = { id: socket.id, x: posX, y: posY, character: avatarCur, name: usernameCur };
                socket.join(`${roomId}:${newScene}`);

                socket.emit('sceneSwitched', { players: rooms[roomId].levels[newScene], scene: newScene });

                socket.to(`${roomId}:${newScene}`).emit(`newPlayer:${newScene}`, rooms[roomId].levels[newScene][socket.id]);

                // Переподключаем слушатель для новой сцены
                socket.on(`playerMovement:${newScene}`, (movementData) => {
                    if (rooms[roomId].levels[newScene][socket.id]) {
                        rooms[roomId].levels[newScene][socket.id].x = movementData.x;
                        rooms[roomId].levels[newScene][socket.id].y = movementData.y;
                        rooms[roomId].levels[newScene][socket.id].velocityX = movementData.velocityX;
                        rooms[roomId].levels[newScene][socket.id].velocityY = movementData.velocityY;
                        io.to(`${roomId}:${newScene}`).emit(`playerMoved:${newScene}`, { id: socket.id, ...movementData });
                    }
                });
            });

            socket.on('playerReconnect', (newSettings) => {
                if (rooms[roomId].levels[socket.currentLevel][socket.id]) {
                    io.to(`${roomId}:${socket.currentLevel}`).emit('playerDisconnected', socket.id);

                    rooms[roomId].levels[socket.currentLevel][socket.id] = { id: socket.id, x: newSettings.x, y: newSettings.y, character: newSettings.avatar, name: newSettings.name };
                    socket.to(`${roomId}:${socket.currentLevel}`).emit(`newPlayer:${socket.currentLevel}`, rooms[roomId].levels[socket.currentLevel][socket.id]);
                }
            })
        } catch (err) {
            console.error('Error joining room:', err);
            socket.emit('error', 'An error occurred');
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
