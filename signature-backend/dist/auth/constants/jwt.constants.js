"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET || 'DEFAULT_VERY_SECRET_KEY_CHANGE_ME',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'DEFAULT_VERY_SECRET_REFRESH_KEY_CHANGE_ME_TOO',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
//# sourceMappingURL=jwt.constants.js.map