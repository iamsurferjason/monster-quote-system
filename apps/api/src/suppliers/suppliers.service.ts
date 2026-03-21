import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      include: { contacts: true },
      orderBy: { companyName: 'asc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { contacts: true },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const count = await this.prisma.supplier.count();
    const supplierCode = `S-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.supplier.create({
      data: {
        supplierCode,
        companyName: dto.companyName,
        taxId: dto.taxId,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        bankName: dto.bankName,
        bankCode: dto.bankCode,
        bankAccount: dto.bankAccount,
        bankAccountName: dto.bankAccountName,
        paymentTerms: dto.paymentTerms,
        contacts: dto.contacts
          ? { create: dto.contacts }
          : undefined,
      },
      include: { contacts: true },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);

    const { contacts, ...supplierData } = dto;

    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...supplierData,
        ...(contacts !== undefined && {
          contacts: {
            deleteMany: {},
            create: contacts,
          },
        }),
      },
      include: { contacts: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
