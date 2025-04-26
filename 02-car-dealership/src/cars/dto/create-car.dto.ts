import { IsString } from 'class-validator';

export class CreateCarDto {
  @IsString()
  public readonly brand: string;

  @IsString()
  public readonly model: string;
}
