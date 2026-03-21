import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateSupplierDto } from './create-supplier.dto';
import { SupplierStatus } from '@prisma/client';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;
}
