import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SendResetMailComponent } from './send-reset-mail/send-reset-mail.component';



@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    SendResetMailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class AuthModule { }
