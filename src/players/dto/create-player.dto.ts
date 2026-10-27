import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePlayerDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    displayName!: string;
}

