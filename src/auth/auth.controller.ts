import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a user and issue an access token" })
  @ApiCreatedResponse({ description: "User registered" })
  @ApiBadRequestResponse({ description: "Invalid registration data" })
  @ApiConflictResponse({ description: "Email is already registered" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Authenticate and issue an access token" })
  @ApiOkResponse({ description: "Access token issued" })
  @ApiBadRequestResponse({ description: "Invalid credentials format" })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
