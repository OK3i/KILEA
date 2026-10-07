import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UserRole } from "../database/entities/user-role.enum";
import { AuthenticatedUser } from "./current-user.decorator";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization?.trim().split(/\s+/);

    if (
      authorization?.length !== 2 ||
      authorization[0].toLowerCase() !== "bearer" ||
      !authorization[1]
    ) {
      throw new UnauthorizedException("Bearer access token is required");
    }

    let payload: { sub: number; email: string; role: UserRole };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: UserRole;
      }>(authorization[1]);
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }

    if (
      !Number.isSafeInteger(payload.sub) ||
      payload.sub <= 0 ||
      typeof payload.email !== "string" ||
      !Object.values(UserRole).includes(payload.role)
    ) {
      throw new UnauthorizedException("Invalid access token payload");
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return true;
  }
}
