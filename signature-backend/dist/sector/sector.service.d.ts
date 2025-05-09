import { Repository } from 'typeorm';
import { Sector } from './sector.entity';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
export declare class SectorService {
    private sectorRepository;
    constructor(sectorRepository: Repository<Sector>);
    create(createSectorDto: CreateSectorDto): Promise<Sector>;
    findAll(): Promise<Sector[]>;
    findOne(id: number): Promise<Sector>;
    update(id: number, updateSectorDto: UpdateSectorDto): Promise<Sector>;
    remove(id: number): Promise<void>;
}
