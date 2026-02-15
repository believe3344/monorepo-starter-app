import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { success } from '@/common/utils/response';
import { ApiResponse, ILoginResponse } from '@app/shared';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return success(user, '注册成功');
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { ttl: 60000, limit: 5 }, medium: { ttl: 60000, limit: 5 } })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<ILoginResponse>> {
    const result = await this.authService.login(loginDto);
    return success(result, '登录成功');
  }
}
