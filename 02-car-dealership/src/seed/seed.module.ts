import { Module } from '@nestjs/common';

import { BrandsModule } from 'src/brands/brands.module';
import { CarsModule } from 'src/cars/cars.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  controllers: [SeedController],
  imports: [BrandsModule, CarsModule],
  providers: [SeedService],
})
export class SeedModule {}
