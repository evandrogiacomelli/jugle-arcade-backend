import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateRoundDto } from './dto/create-round.dto';
import { RoundsService } from './rounds.service';

@Controller('rounds')
export class RoundsController {
    constructor(private readonly roundsService: RoundsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateRoundDto): Promise<{ id: number, status: string, mineCount: number, createdAt: Date }> {
        return this.roundsService.create(dto);
    }
}
