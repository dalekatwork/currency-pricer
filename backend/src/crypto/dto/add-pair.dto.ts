import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CoinDto {
  @ApiProperty({
    description: "CoinGecko API ID for the cryptocurrency",
    example: "bitcoin",
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: "Trading symbol of the cryptocurrency",
    example: "BTC",
  })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: "Full name of the cryptocurrency",
    example: "Bitcoin",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AddPairDto {
  @ApiProperty({
    description: "Source cryptocurrency information",
    type: CoinDto,
  })
  @ValidateNested()
  @Type(() => CoinDto)
  from: CoinDto;

  @ApiProperty({
    description: "Target cryptocurrency information",
    type: CoinDto,
  })
  @ValidateNested()
  @Type(() => CoinDto)
  to: CoinDto;
}
