import {
    IsIn,
    IsInt,
    IsNotEmpty,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateLedgerEntryDto {
    @IsIn(['CREDIT', 'DEBIT'])
    type!: 'CREDIT' | 'DEBIT';

    @IsInt()
    @Min(1)
    amount!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    description!: string;
}
