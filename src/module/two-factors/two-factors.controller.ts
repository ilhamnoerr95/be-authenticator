import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeaders, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetClientApp } from '../../common/decorators/client-app.decorator';
import { ClientAppGuard } from '../../common/guards/client-app.guard';
import type { ClientAppContext } from '../../common/types/client-app.interface';
import { DisableTwoFactorDto } from './dto/disable-2fa.dto';
import { SetupTwoFactorDto } from './dto/setup-2fa.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';
import { TwoFactorsService } from './two-factors.service';

@ApiTags('Two-Factors')
@ApiHeaders([
  { name: 'x-client-id', required: true, description: 'Client App ID' },
  { name: 'x-client-secret', required: true, description: 'Client App Secret' },
])
@UseGuards(ClientAppGuard)
@Controller({ path: 'two-factors', version: '1' })
export class TwoFactorsController {
  constructor(private readonly twoFactorsService: TwoFactorsService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Initiate 2FA setup — returns QR code data URL and backup codes' })
  @ApiResponse({ status: 201, description: 'QR code and backup codes returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setup(@Body() dto: SetupTwoFactorDto, @GetClientApp() clientApp: ClientAppContext) {
    return this.twoFactorsService.setup(dto, clientApp);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP token and activate 2FA' })
  @ApiResponse({ status: 201, description: '2FA activated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP token or 2FA already enabled' })
  async verify(@Body() dto: VerifyTwoFactorDto, @GetClientApp() clientApp: ClientAppContext) {
    return this.twoFactorsService.verify(dto, clientApp);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate OTP token for authentication flow' })
  @ApiResponse({ status: 201, description: 'Returns { valid: boolean }' })
  @ApiResponse({ status: 400, description: '2FA not enabled for user' })
  async validateOtp(@Body() dto: ValidateOtpDto, @GetClientApp() clientApp: ClientAppContext) {
    return this.twoFactorsService.validateOtp(dto, clientApp);
  }

  @Post('disable')
  @ApiOperation({ summary: 'Disable 2FA (requires valid OTP token)' })
  @ApiResponse({ status: 201, description: '2FA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP token or 2FA not enabled' })
  async disable(@Body() dto: DisableTwoFactorDto, @GetClientApp() clientApp: ClientAppContext) {
    return this.twoFactorsService.disable(dto, clientApp);
  }
}
