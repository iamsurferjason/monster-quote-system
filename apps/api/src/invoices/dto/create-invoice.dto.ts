import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, IsArray, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional() @IsUUID() orderId?: string;
  @IsUUID() customerId: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsNumber() @Min(0) subtotal: number;
  @IsNumber() @Min(0) taxAmount: number;
  @IsNumber() @Min(0) totalAmount: number;
  @IsOptional() @IsString() notes?: string;
}
