"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let NotificationsGateway = class NotificationsGateway {
    server;
    logger = new common_1.Logger('NotificationsGateway');
    connectedUsers = new Map();
    afterInit(server) {
        this.logger.log('WebSocket Gateway Initialized');
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        let userIdToRemove = null;
        for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === client.id) {
                userIdToRemove = userId;
                break;
            }
        }
        if (userIdToRemove !== null) {
            this.connectedUsers.delete(userIdToRemove);
            this.logger.log(`Removed user ID ${userIdToRemove} from connected users map.`);
        }
    }
    handleRegisterUser(userId, client) {
        if (userId && client.id) {
            this.connectedUsers.set(userId, client.id);
            this.logger.log(`Registered user ID ${userId} with socket ID ${client.id}`);
            client.emit('registrationSuccess', { userId: userId });
        }
    }
    sendNotificationToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.logger.log(`Sending event '${event}' to user ID ${userId} (socket ID: ${socketId})`);
            this.server.to(socketId).emit(event, data);
            return true;
        }
        else {
            this.logger.log(`User ID ${userId} not connected, cannot send event '${event}'`);
            return false;
        }
    }
    broadcastNotification(event, data) {
        this.logger.log(`Broadcasting event '${event}' to all connected clients`);
        this.server.emit(event, data);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('registerUser'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleRegisterUser", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], NotificationsGateway);
//# sourceMappingURL=notification.gateway.js.map