import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity()
export class TradingPair {
  @PrimaryColumn()
  id: string;

  @Column("json")
  fromCoin: {
    id: string;
    symbol: string;
    name: string;
  };

  @Column("json")
  toCoin: {
    id: string;
    symbol: string;
    name: string;
  };

  @Column()
  active: boolean;

  @CreateDateColumn()
  addedAt: Date;

  @Column({ nullable: true, type: "datetime" })
  deactivatedAt?: Date;
}
