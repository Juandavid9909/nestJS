import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    description: 'Product ID',
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'T-Shirt Teslo',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    description: 'Product price',
    example: 0,
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    default: null,
    description: 'Product description',
    example: 'Anim reprehenderit nulla in anim mollit minim irure commodo.',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: 't_shirt_teslo',
    example: 'Product SLUG - for SEO',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    default: 0,
    description: 'Product stock',
    example: 10,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    description: 'Product sizes',
    example: ['M', 'XL', 'XXL'],
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    description: 'Product gender',
    example: 'women',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    description: 'Product tags',
    example: ['my tag'],
  })
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
