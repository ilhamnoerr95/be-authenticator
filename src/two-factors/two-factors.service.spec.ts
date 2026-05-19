import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorsService } from './two-factors.service';

describe('TwoFactorsService', () => {
  let service: TwoFactorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwoFactorsService],
    }).compile();

    service = module.get<TwoFactorsService>(TwoFactorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
