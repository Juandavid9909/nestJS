import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Pokemon extends Document {
  // id: string // Mongo me lo da
  @Prop({
    index: true,
    unique: true,
  })
  name: string;

  @Prop({
    index: true,
    unique: true,
  })
  no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
