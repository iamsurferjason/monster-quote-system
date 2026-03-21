import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class AddPaymentDto {
  @IsNumber() @Min(0.01) amount: number;
  @IsDateString() paymentDate: string;
  @IsOptional() @IsString() method?: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() notes?: string;
}
