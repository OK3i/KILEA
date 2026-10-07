import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { DataSource } from "typeorm";
import { UserRole } from "../database/entities/user-role.enum";
import { AuthenticatedUser } from "./current-user.decorator";
import { OWNERSHIP_RULE_KEY, OwnershipRule } from "./ownership.decorator";

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
  params: Record<string, string>;
};

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rule = this.reflector.get<OwnershipRule>(
      OWNERSHIP_RULE_KEY,
      context.getHandler(),
    );
    if (!rule) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authentication is required");
    }

    const resourceId = Number(request.params[rule.resourceIdParam]);
    if (!Number.isSafeInteger(resourceId) || resourceId <= 0) {
      throw new BadRequestException("Resource ID must be a positive integer");
    }

    const repository = this.dataSource.getRepository(rule.entity);
    const resource = await repository
      .createQueryBuilder("resource")
      .select(`resource.${rule.ownerIdProperty}`, "ownerId")
      .where("resource.id = :resourceId", { resourceId })
      .getRawOne<{ ownerId: number }>();

    if (!resource) throw new NotFoundException("Resource not found");
    if (user.role !== UserRole.ADMIN && resource.ownerId !== user.id) {
      throw new ForbiddenException("You can manage only your own resource");
    }

    return true;
  }
}
