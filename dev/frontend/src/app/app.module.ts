import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { RouterModule }        from '@angular/router';

import { AppComponent }              from './app.component';
import { SignupComponent }           from './signup/signup.component';
import { OtpVerificationComponent }  from './otp-verification/otp-verification.component';
import { LoginComponent }            from './login/login.component';
import { DashboardComponent }        from './dashboard/dashboard.component';
import { AuthGuard }                 from './auth.guard';
import { authRoutes }                from './app.routes';

@NgModule({
  // ─── NO declarations: [] ─────────────────────────────────────
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(authRoutes),

    // ─── Import your standalone components ────────────────────
    AppComponent,
    SignupComponent,
    OtpVerificationComponent,
    LoginComponent,
    DashboardComponent
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
