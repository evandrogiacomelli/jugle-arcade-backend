import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

import { CreateRoundDto } from './dto/create-round.dto';
import { RoundsService } from './rounds.service';
import { RevealPositionDto } from './dto/reveal-position.dto';
import { BadRequestException } from '@nestjs/common';
import { RoundDomainException } from './domain/round-domain.exception';

@Controller('rounds')
export class RoundsController {
    constructor(private readonly roundsService: RoundsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateRoundDto): Promise<{ id: number, status: string, mineCount: number, createdAt: Date }> {
        return this.roundsService.create(dto);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        const round = await this.roundsService.findById(id);

        if (!round) {
            throw new NotFoundException('Round not found');
        }

        return round;
    }

    // @Post(':id/reveal')
    // async reveal(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body() dto: RevealPositionDto,
    // ) {
    //     const result = await this.roundsService.reveal(id, dto.position);
    //
    //     if (!result) {
    //         throw new NotFoundException('Round not found');
    //     }
    //
    //     return result;
    // }

    @Post(':id/reveal')
    async reveal(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RevealPositionDto,
    ) {
        try {
            const result = await this.roundsService.reveal(id, dto.position);

            if (!result) {
                throw new NotFoundException('Round not found');
            }

            return result;
        } catch (error) {
            if (error instanceof RoundDomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }

}
