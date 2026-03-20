import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum TradeMode {
  DOMESTIC = 'DOMESTIC',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  TRIANGULAR = 'TRIANGULAR',
}

enum CurrencyCode {
  TWD = 'TWD',
  USD = 'USD',
  JPY = 'JPY',
  EUR = 'EUR',
  CNY = 'CNY',
}

enum Incoterm {
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

class CreateQuotationItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string | null;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qty!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountRate?: number;
}

export class CreateQuotationDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  createdById!: string;

  @IsOptional()
  @IsEnum(TradeMode)
  tradeMode?: TradeMode;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currencyCode?: CurrencyCode;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  exchangeRate?: number;

  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

  @IsOptional()
  @IsString()
  shipFromCountry?: string;

  @IsOptional()
  @IsString()
  shipToCountry?: string;

  @IsOptional()
  @IsString()
  loadingPort?: string;

  @IsOptional()
  @IsString()
  dischargePort?: string;

  @IsOptional()
  @IsString()
  paymentTerm?: string;

  @IsOptional()
  @IsString()
  validityDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items!: CreateQuotationItemDto[];
}