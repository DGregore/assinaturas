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
exports.SectorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sector_entity_1 = require("./sector.entity");
let SectorService = class SectorService {
    sectorRepository;
    constructor(sectorRepository) {
        this.sectorRepository = sectorRepository;
    }
    async create(createSectorDto) {
        const { name } = createSectorDto;
        const existingSector = await this.sectorRepository.findOne({ where: { name } });
        if (existingSector) {
            throw new common_1.BadRequestException(`Setor com nome "${name}" já existe.`);
        }
        const sector = this.sectorRepository.create({ name });
        return this.sectorRepository.save(sector);
    }
    async findAll() {
        return this.sectorRepository.find();
    }
    async findOne(id) {
        const sector = await this.sectorRepository.findOne({ where: { id } });
        if (!sector) {
            throw new common_1.NotFoundException(`Setor com ID ${id} não encontrado.`);
        }
        return sector;
    }
    async update(id, updateSectorDto) {
        const sector = await this.findOne(id);
        const { name } = updateSectorDto;
        if (name && name !== sector.name) {
            const existingSector = await this.sectorRepository.findOne({ where: { name } });
            if (existingSector) {
                throw new common_1.BadRequestException(`Setor com nome "${name}" já existe.`);
            }
        }
        if (name) {
            sector.name = name;
        }
        return this.sectorRepository.save(sector);
    }
    async remove(id) {
        const result = await this.sectorRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Setor com ID ${id} não encontrado.`);
        }
    }
};
exports.SectorService = SectorService;
exports.SectorService = SectorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sector_entity_1.Sector)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SectorService);
//# sourceMappingURL=sector.service.js.map