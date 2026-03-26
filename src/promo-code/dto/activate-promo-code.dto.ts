import { IsEmail } from 'class-validator';

export class ActivatePromoCodeDto {
  @IsEmail()
  email: string;
}
