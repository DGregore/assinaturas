"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const document_module_1 = require("./document/document.module");
const notification_module_1 = require("./notification/notification.module");
const user_entity_1 = require("./user/user.entity");
const user_module_1 = require("./user/user.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const sector_module_1 = require("./sector/sector.module");
const sector_entity_1 = require("./sector/sector.entity");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const document_entity_1 = require("./document/document.entity");
const document_signatory_entity_1 = require("./document/document-signatory.entity");
const refresh_token_entity_1 = require("./auth/entities/refresh-token.entity");
const signature_module_1 = require("./signature/signature.module");
const signature_entity_1 = require("./signature/signature.entity");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const audit_log_entity_1 = require("./audit-log/audit-log.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', '144.126.136.132'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'dg!!#!((%$'),
                    database: configService.get('DB_DATABASE', 'signature_db'),
                    entities: [
                        user_entity_1.User,
                        sector_entity_1.Sector,
                        document_entity_1.Document,
                        document_signatory_entity_1.DocumentSignatory,
                        refresh_token_entity_1.RefreshToken,
                        signature_entity_1.Signature,
                        audit_log_entity_1.AuditLog,
                    ],
                    synchronize: configService.get('NODE_ENV', 'development') !== 'production',
                }),
                inject: [config_1.ConfigService],
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            document_module_1.DocumentModule,
            signature_module_1.SignatureModule,
            sector_module_1.SectorModule,
            notification_module_1.NotificationModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_PIPE,
                useValue: new common_1.ValidationPipe({
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    transform: true,
                }),
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map