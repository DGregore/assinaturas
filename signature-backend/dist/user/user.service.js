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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./user.entity");
const sector_service_1 = require("../sector/sector.service");
let UserService = class UserService {
    userRepository;
    sectorService;
    constructor(userRepository, sectorService) {
        this.userRepository = userRepository;
        this.sectorService = sectorService;
    }
    userToPublicProfile(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            sector: user.sector,
        };
    }
    usersToPublicProfile(users) {
        return users.map(user => this.userToPublicProfile(user));
    }
    async create(createUserDto) {
        const { name, email, password, sectorId, role } = createUserDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('Email já cadastrado.');
        }
        let sectorEntity = null;
        if (sectorId) {
            try {
                sectorEntity = await this.sectorService.findOne(sectorId);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    throw new common_1.BadRequestException(`Setor com ID ${sectorId} não encontrado.`);
                }
                else {
                    throw error;
                }
            }
        }
        const user = this.userRepository.create({
            name,
            email,
            password,
            sector: sectorEntity,
            role: role || user_entity_1.UserRole.USER,
        });
        const savedUser = await this.userRepository.save(user);
        return this.userToPublicProfile(savedUser);
    }
    async findAll() {
        const users = await this.userRepository.find({
            relations: ['sector'],
        });
        return this.usersToPublicProfile(users);
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['sector'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
        return this.userToPublicProfile(user);
    }
    async searchUsers(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        const users = await this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.sector', 'sector')
            .where('user.name ILIKE :query OR user.email ILIKE :query', { query: `%${query}%` })
            .getMany();
        return this.usersToPublicProfile(users);
    }
    async findByEmailWithPassword(email) {
        return this.userRepository.createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.sector', 'sector')
            .where('user.email = :email', { email })
            .getOne();
    }
    async update(id, updateUserDto) {
        const user = await this.userRepository.createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.sector', 'sector')
            .where('user.id = :id', { id })
            .getOne();
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
        const { name, email, password, sectorId, role } = updateUserDto;
        if (email && email !== user.email) {
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.BadRequestException('Email já cadastrado por outro usuário.');
            }
            user.email = email;
        }
        if (sectorId !== undefined) {
            if (sectorId === null) {
                user.sector = null;
            }
            else {
                try {
                    const sector = await this.sectorService.findOne(sectorId);
                    user.sector = sector;
                }
                catch (error) {
                    if (error instanceof common_1.NotFoundException) {
                        throw new common_1.BadRequestException(`Setor com ID ${sectorId} não encontrado.`);
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
        if (name)
            user.name = name;
        if (role)
            user.role = role;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        const savedUser = await this.userRepository.save(user);
        return this.userToPublicProfile(savedUser);
    }
    async remove(id) {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sector_service_1.SectorService])
], UserService);
//# sourceMappingURL=user.service.js.map