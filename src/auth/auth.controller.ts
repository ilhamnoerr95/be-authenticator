import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeaders, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ClientAppGuard } from '../common/guards/client-app.guard';
import { GetClientApp } from '../common/decorators/client-app.decorator';
import type { ClientAppContext } from '../common/types/client-app.interface';

@ApiTags('Auth')
@ApiHeaders([
  { name: 'x-client-id', required: true, description: 'Client App ID' },
  { name: 'x-client-secret', required: true, description: 'Client App Secret' },
])
@UseGuards(ClientAppGuard)
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user for the client application' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already registered for this application' })
  async register(
    @Body() dto: RegisterUserDto,
    @GetClientApp() clientApp: ClientAppContext,
  ) {
    return this.authService.registerUser(dto, clientApp);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users for the client application' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers(@GetClientApp() clientApp: ClientAppContext) {
    return this.authService.getUsers(clientApp);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Param('userId') userId: string,
    @GetClientApp() clientApp: ClientAppContext,
  ) {
    return this.authService.getUserById(userId, clientApp);
  }
}
