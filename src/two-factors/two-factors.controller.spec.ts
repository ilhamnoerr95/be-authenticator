import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorsController } from './two-factors.controller';

describe('TwoFactorsController', () => {
  let controller: TwoFactorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorsController],
    }).compile();

    controller = module.get<TwoFactorsController>(TwoFactorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
