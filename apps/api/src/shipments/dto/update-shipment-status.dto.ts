import { IsEnum } from 'class-validator';

export enum ShipmentStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  CUSTOMS_CLEARANCE = 'CUSTOMS_CLEARANCE',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;
}
