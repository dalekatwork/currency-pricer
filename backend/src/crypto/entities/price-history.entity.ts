import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pairId: string;

  @Column()
  fromSymbol: string;

  @Column()
  toSymbol: string;

  @Column("decimal", { precision: 18, scale: 8 })
  price: number;

  @Column("decimal", { precision: 18, scale: 8 })
  change24h: number;

  @Column("decimal", { precision: 18, scale: 8 })
  changePercentage24h: number;

  @CreateDateColumn()
  timestamp: Date;
}
