import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastService } from '../../services/toast.service';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatSuffix,
    MatProgressSpinner,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
],
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);


  @ViewChild('forgotPasswordDialog') forgotPasswordDialog: TemplateRef<unknown>;

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  forgotPasswordForm: FormGroup;
  showDialog = false;
  forgotPasswordLoading = false;
  forgotPasswordSubmitted = false;
  hidePassword = true;
  private forgotPasswordDialogRef: MatDialogRef<unknown> | null = null;

  constructor() {
    // redirect to home if already logged in
    if (this.authenticationService.isAuthenticated) {
      this.router.navigate(['dashboard']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.forgotPasswordForm = this.formBuilder.group({
      username: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'dashboard';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  // convenience getter for easy access to form fields
  get ff() { return this.forgotPasswordForm.controls; }

  openForgotPasswordDialog() {
    this.forgotPasswordForm.reset();
    this.forgotPasswordSubmitted = false;
    this.forgotPasswordDialogRef = this.dialog.open(this.forgotPasswordDialog, {
      width: 'min(92vw, 480px)'
    });
    const dialogRef = this.forgotPasswordDialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.forgotPasswordDialogRef === dialogRef) {
        this.forgotPasswordDialogRef = null;
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.authenticationService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: data => {
          if (data?.token && this.authenticationService.isAuthenticated) {
            if (data.roleId == 7) {
              this.router.navigate(['properties']);
            } else {
              this.router.navigate(['dashboard']);
            }
          } else {
            this.authenticationService.clearSession();
            this.showLoginError('Invalid username or password');
            this.loading = false;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.authenticationService.clearSession();
          const message = error.status === 401 || error.status === 403
            ? 'Invalid username or password'
            : this.toastService.getApiErrorMessage(error);
          this.showLoginError(message);
          this.loading = false;
        }
      });
  }

  onForgotPasswordSubmit(){
    this.forgotPasswordSubmitted = true;
    this.forgotPasswordLoading = false;
    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.forgotPasswordLoading = true;
    if (this.forgotPasswordDialogRef) {
      this.forgotPasswordDialogRef.disableClose = true;
    }
    const randomstring = Math.random().toString(36).slice(-8);
    this.userService.forgotpassword(this.ff.username.value, randomstring).pipe(first()).subscribe(isUpdated => {
      if (isUpdated) {
        this.forgotPasswordDialogRef?.close();
        this.toastService.showSuccess('Please check your email to change your password.');
        this.forgotPasswordLoading = false;
      } else {
        if (this.forgotPasswordDialogRef) {
          this.forgotPasswordDialogRef.disableClose = false;
        }
        this.toastService.showError('We could not find an account with that username.');
        this.forgotPasswordLoading = false;
      }
    }, () => {
      if (this.forgotPasswordDialogRef) {
        this.forgotPasswordDialogRef.disableClose = false;
      }
      this.toastService.showError('Unable to process your request. Please try again.');
      this.forgotPasswordLoading = false;
    });
  }

  private showLoginError(message: string) {
    this.toastService.showError(message);
  }

}
