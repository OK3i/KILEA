import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserRole } from "../database/entities/user-role.enum";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
