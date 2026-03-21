import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsEmail() to: string;
  @IsString() subject: string;
  @IsString() html: string;
  @IsOptional() @IsString() text?: string;
}
