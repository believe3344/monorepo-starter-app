import { CreateUserDto as SharedCreateUserDto, UserRole } from '@app/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto extends SharedCreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  declare username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  declare email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  declare password: string;

  @ApiPropertyOptional({
    description: '角色',
    enum: UserRole,
    default: UserRole.USER,
  })
  declare role?: UserRole;
}
