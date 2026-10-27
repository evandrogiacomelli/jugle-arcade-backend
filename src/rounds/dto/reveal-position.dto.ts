import { IsInt, Max, Min } from 'class-validator';

export class RevealPositionDto {
    @IsInt()
    @Min(0)
    @Max(24)
    position!: number;
}
