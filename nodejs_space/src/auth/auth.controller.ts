import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SetupDto } from './dto/setup.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'First-time PIN setup' })
  @ApiResponse({ status: 200, description: 'Setup successful' })
  @ApiResponse({ status: 409, description: 'Authentication already set up' })
  async setup(@Body() setupDto: SetupDto) {
    return this.authService.setup(setupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with PIN' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid PIN' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
