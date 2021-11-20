import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AdminGuard } from './guards/admin.guard';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SendResetMailComponent } from './auth/send-reset-mail/send-reset-mail.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'reset-password', component: SendResetMailComponent},

  { path: 'resetpassword/:token', component: ResetPasswordComponent},

  
  {
    path: 'admin', loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule), canActivate: [AuthenticationGuard]
  },
  {
    path: 'administration', loadChildren: () => import('./administration/administration.module')
      .then(m => m.AdministrationModule), canActivate: [AuthenticationGuard, AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }