import { IsInt, Max, Min } from 'class-validator';

export class CreateRoundDto {
    @IsInt()
    @Min(1)
    @Max(24)
    mineCount!: number;
}
