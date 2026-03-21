import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CurrencyCode {
  TWD = 'TWD',
  USD = 'USD',
  JPY = 'JPY',
  EUR = 'EUR',
  CNY = 'CNY',
}

export enum Incoterm {
  EXW = 'EXW',
  FOB = 'FOB',
  CFR = 'CFR',
  CIF = 'CIF',
  FCA = 'FCA',
  CPT = 'CPT',
  CIP = 'CIP',
  DAP = 'DAP',
  DDP = 'DDP',
}

export class CreatePurchaseOrderItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsString()
  productName: string;

  @IsNumber()
  @Min(0.01)
  qty: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currencyCode?: CurrencyCode;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

  @IsOptional()
  @IsString()
  paymentTerm?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  warehouseNote?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}
