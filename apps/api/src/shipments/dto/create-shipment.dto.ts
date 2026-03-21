import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateShipmentDto {
  @IsUUID() orderId: string;
  @IsOptional() @IsString() carrier?: string;
  @IsOptional() @IsString() trackingNo?: string;
  @IsOptional() @IsDateString() shippingDate?: string;
  @IsOptional() @IsDateString() estimatedArrival?: string;
  @IsOptional() @IsString() originCountry?: string;
  @IsOptional() @IsString() destCountry?: string;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsInt() @Min(1) packageCount?: number;
  @IsOptional() @IsString() notes?: string;
}
