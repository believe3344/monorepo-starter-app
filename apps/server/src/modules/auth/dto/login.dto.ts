import { LoginDto as SharedLoginDto } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto extends SharedLoginDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  declare username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  declare password: string;
}
