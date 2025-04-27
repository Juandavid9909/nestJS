import { Module } from '@nestjs/common';

import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  controllers: [BrandsController],
  exports: [BrandsService],
  providers: [BrandsService],
})
export class BrandsModule {}
