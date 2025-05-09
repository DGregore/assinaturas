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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const jwt_constants_1 = require("./constants/jwt.constants");
let AuthService = class AuthService {
    userService;
    jwtService;
    refreshTokenRepository;
    constructor(userService, jwtService, refreshTokenRepository) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async validateUser(email, pass) {
        const user = await this.userService.findByEmailWithPassword(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                sector: user.sector,
            };
        }
        return null;
    }
    async generateTokens(user) {
        const accessTokenPayload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(accessTokenPayload, {
            secret: jwt_constants_1.jwtConstants.secret,
            expiresIn: jwt_constants_1.jwtConstants.expiresIn,
        });
        const refreshTokenPayload = { sub: user.id };
        const refreshToken = this.jwtService.sign(refreshTokenPayload, {
            secret: jwt_constants_1.jwtConstants.refreshSecret,
            expiresIn: jwt_constants_1.jwtConstants.refreshExpiresIn,
        });
        await this.storeRefreshToken(refreshToken, user.id);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: user,
        };
    }
    async storeRefreshToken(token, userId) {
        const hashedToken = await bcrypt.hash(token, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.update({ userId: userId, isRevoked: false }, { isRevoked: true });
        const refreshTokenRecord = this.refreshTokenRepository.create({
            userId,
            hashedToken,
            expiresAt,
            isRevoked: false,
        });
        await this.refreshTokenRepository.save(refreshTokenRecord);
    }
    async login(user) {
        return this.generateTokens(user);
    }
    async refreshToken(refreshTokenValue) {
        try {
            const payload = this.jwtService.verify(refreshTokenValue, {
                secret: jwt_constants_1.jwtConstants.refreshSecret,
            });
            const userId = payload.sub;
            const storedTokens = await this.refreshTokenRepository.find({
                where: { userId: userId, isRevoked: false },
                order: { expiresAt: 'DESC' },
            });
            let validStoredToken = null;
            for (const storedToken of storedTokens) {
                if (await bcrypt.compare(refreshTokenValue, storedToken.hashedToken)) {
                    validStoredToken = storedToken;
                    break;
                }
            }
            if (!validStoredToken) {
                throw new common_1.UnauthorizedException('Refresh token inválido ou revogado.');
            }
            if (validStoredToken.expiresAt < new Date()) {
                validStoredToken.isRevoked = true;
                await this.refreshTokenRepository.save(validStoredToken);
                throw new common_1.UnauthorizedException('Refresh token expirado.');
            }
            validStoredToken.isRevoked = true;
            await this.refreshTokenRepository.save(validStoredToken);
            const user = await this.userService.findOne(userId);
            if (!user) {
                throw new common_1.UnauthorizedException('Usuário não encontrado.');
            }
            const accessTokenPayload = { email: user.email, sub: user.id, role: user.role };
            const newAccessToken = this.jwtService.sign(accessTokenPayload, {
                secret: jwt_constants_1.jwtConstants.secret,
                expiresIn: jwt_constants_1.jwtConstants.expiresIn,
            });
            return { access_token: newAccessToken };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Refresh token inválido ou expirado.');
        }
    }
    async revokeRefreshTokenForUser(userId) {
        await this.refreshTokenRepository.update({ userId: userId, isRevoked: false }, { isRevoked: true });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map