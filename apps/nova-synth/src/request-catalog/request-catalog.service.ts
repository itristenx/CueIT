import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRequestCatalogItemDto,
  UpdateRequestCatalogItemDto,
  CreateRequestDto,
} from './dto/request-catalog.dto';
import { RequestCatalogCategory } from '../../generated/prisma';

@Injectable()
export class RequestCatalogService {
  constructor(private prisma: PrismaService) {}

  async createCatalogItem(
    createDto: CreateRequestCatalogItemDto,
    userId: string,
  ) {
    return this.prisma.requestCatalogItem.create({
      data: {
        ...createDto,
        formFields: JSON.stringify(createDto.formFields),
        approvalRequired: createDto.approvalRequired || undefined,
        tags: createDto.tags || [],
        createdBy: userId,
        isActive: createDto.isActive ?? true,
      },
    });
  }

  async findAllCatalogItems(
    category?: RequestCatalogCategory,
    isActive?: boolean,
  ) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const items = await this.prisma.requestCatalogItem.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    return items.map((item) => ({
      ...item,
      formFields: JSON.parse(item.formFields as string),
      approvalRequired: item.approvalRequired || null,
    }));
  }

  async findCatalogItemById(id: string) {
    const item = await this.prisma.requestCatalogItem.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Request catalog item not found');
    }

    return {
      ...item,
      formFields: JSON.parse(item.formFields as string),
      approvalRequired: item.approvalRequired || null,
    };
  }

  async updateCatalogItem(
    id: string,
    updateDto: UpdateRequestCatalogItemDto,
    userId: string,
  ) {
    const item = await this.prisma.requestCatalogItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Request catalog item not found');
    }

    // Check if user can update this item (admin or creator)
    // This would need to be enhanced with proper role checking

    const updateData: any = { ...updateDto };

    if (updateDto.formFields) {
      updateData.formFields = JSON.stringify(updateDto.formFields);
    }

    if (updateDto.approvalRequired) {
      updateData.approvalRequired = updateDto.approvalRequired;
    }

    return this.prisma.requestCatalogItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCatalogItem(id: string, userId: string) {
    const item = await this.prisma.requestCatalogItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Request catalog item not found');
    }

    // Soft delete - just mark as inactive
    return this.prisma.requestCatalogItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createRequest(createDto: CreateRequestDto, userId: string) {
    const catalogItem = await this.prisma.requestCatalogItem.findUnique({
      where: { id: createDto.catalogItemId },
    });

    if (!catalogItem) {
      throw new NotFoundException('Request catalog item not found');
    }

    if (!catalogItem.isActive) {
      throw new ForbiddenException('Request catalog item is not active');
    }

    // Validate form data against catalog item form fields
    const formFields = JSON.parse(catalogItem.formFields as string);
    this.validateFormData(createDto.formData, formFields);

    // Create the request as a ticket with special type
    return this.prisma.ticket.create({
      data: {
        title: createDto.title,
        description:
          createDto.description || `Service request: ${catalogItem.name}`,
        ticketNumber: `REQ-${Date.now()}`,
        status: 'OPEN',
        priority:
          createDto.urgency === 'urgent'
            ? 'URGENT'
            : createDto.urgency === 'high'
              ? 'HIGH'
              : createDto.urgency === 'low'
                ? 'LOW'
                : 'MEDIUM',
        category: 'service_request',
        creatorId: userId,
        catalogItemId: createDto.catalogItemId,
        metadata: JSON.stringify({
          catalogItemId: createDto.catalogItemId,
          catalogItemName: catalogItem.name,
          formData: createDto.formData,
          justification: createDto.justification,
        }),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findRequestsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: {
          creatorId: userId,
          category: 'service_request',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({
        where: {
          creatorId: userId,
          category: 'service_request',
        },
      }),
    ]);

    return {
      requests: requests.map((request) => ({
        ...request,
        metadata: request.metadata
          ? JSON.parse(request.metadata as string)
          : null,
      })),
      total,
      page,
      limit,
    };
  }

  async getCatalogStats() {
    const [totalItems, activeItems, totalRequests, categoryCounts] =
      await Promise.all([
        this.prisma.requestCatalogItem.count(),
        this.prisma.requestCatalogItem.count({ where: { isActive: true } }),
        this.prisma.ticket.count({ where: { category: 'service_request' } }),
        this.prisma.requestCatalogItem.groupBy({
          by: ['category'],
          _count: { _all: true },
          where: { isActive: true },
        }),
      ]);

    return {
      totalItems,
      activeItems,
      totalRequests,
      categoryCounts: categoryCounts.reduce(
        (acc, item) => {
          acc[item.category] = item._count._all;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  private validateFormData(formData: Record<string, any>, formFields: any[]) {
    for (const field of formFields) {
      if (
        field.required &&
        (formData[field.name] === undefined ||
          formData[field.name] === null ||
          formData[field.name] === '')
      ) {
        throw new ForbiddenException(`Field '${field.label}' is required`);
      }

      // Add more validation logic based on field type
      if (formData[field.name] !== undefined && formData[field.name] !== null) {
        switch (field.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])) {
              throw new ForbiddenException(
                `Field '${field.label}' must be a valid email address`,
              );
            }
            break;
          case 'url':
            try {
              new URL(formData[field.name]);
            } catch {
              throw new ForbiddenException(
                `Field '${field.label}' must be a valid URL`,
              );
            }
            break;
          case 'number':
            if (isNaN(Number(formData[field.name]))) {
              throw new ForbiddenException(
                `Field '${field.label}' must be a number`,
              );
            }
            break;
          case 'select':
          case 'radio':
            if (
              field.options &&
              !field.options.some(
                (opt: any) => opt.value === formData[field.name],
              )
            ) {
              throw new ForbiddenException(
                `Field '${field.label}' contains an invalid option`,
              );
            }
            break;
          case 'multiselect':
            if (field.options && Array.isArray(formData[field.name])) {
              const validValues = field.options.map((opt: any) => opt.value);
              if (
                !formData[field.name].every((val: any) =>
                  validValues.includes(val),
                )
              ) {
                throw new ForbiddenException(
                  `Field '${field.label}' contains invalid options`,
                );
              }
            }
            break;
        }
      }
    }
  }
}
