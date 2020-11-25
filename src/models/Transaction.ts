import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  type: 'income' | 'outcome';

  @Column({ type: 'decimal' })
  value: number;

  @ManyToOne(type => Category, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  @JoinColumn({
    name: 'category_id',
    referencedColumnName: 'id',
  })
  category: Category;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'NOW()',
    nullable: true,
  })
  updated_at: Date;
}

export default Transaction;
