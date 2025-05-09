import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './sector.entity';
export declare class SectorController {
    private readonly sectorService;
    constructor(sectorService: SectorService);
    create(createSectorDto: CreateSectorDto): Promise<Sector>;
    findAll(): Promise<Sector[]>;
    findOne(id: number): Promise<Sector>;
    update(id: number, updateSectorDto: UpdateSectorDto): Promise<Sector>;
    remove(id: number): Promise<void>;
}
