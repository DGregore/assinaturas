import { SignatureService } from './signature.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { Signature } from './signature.entity';
export declare class SignatureController {
    private readonly signatureService;
    private readonly logger;
    constructor(signatureService: SignatureService);
    create(createSignatureDto: CreateSignatureDto, req: any): Promise<Signature>;
}
