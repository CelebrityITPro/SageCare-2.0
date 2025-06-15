// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';

export const authRoutes: Routes = [
  { path: 'signup',      component: SignupComponent },
  { path: 'verify-otp',  component: OtpVerificationComponent },
  { path: 'login',       component: LoginComponent },
  { path: 'dashboard',   component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
