import { AfterViewInit, Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/models/user.model';


@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('changePasswordDialog') changePasswordDialog: TemplateRef<unknown>;
  showSettings: boolean = false;
  showDialog: boolean = false;
  changePasswordForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  currentUser: User;
  showSideMenu: boolean = true;
  newPassword: string = '';
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  private passwordDialogRef: MatDialogRef<unknown> | null = null;

  constructor(private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
      if(!this.currentUser.passwordIsChanged)
        this.showDialog = true;
      });
    this.changePasswordForm = this.formBuilder.group({
      oldpassword:new FormControl('',Validators.compose( [Validators.required])),
      newpassword: new FormControl('',Validators.compose([ Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')])),
      confirmpassword: new FormControl('',Validators.compose( [Validators.required])),
    });
  }

  ngAfterViewInit() {
    if (this.showDialog) {
      this.openChangePasswordDialog();
    }
  }

  get f() { return this.changePasswordForm.controls; }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  openChangePasswordDialog() {
    this.showSettings = false;
    this.showDialog = true;
    if (!this.passwordDialogRef) {
      this.passwordDialogRef = this.dialog.open(this.changePasswordDialog, {
        width: 'min(92vw, 520px)',
        disableClose: true
      });
      this.passwordDialogRef.afterClosed().subscribe(() => {
        this.passwordDialogRef = null;
        this.showDialog = false;
      });
    }
  }

  closeChangePasswordDialog() {
    this.passwordDialogRef?.close();
    this.showDialog = false;
  }

  onSubmit() {
    this.submitted = true;
    this.loading = false;
    this.error = '';
    // stop here if form is invalid
    if (this.changePasswordForm.invalid || (this.f.newpassword.value !== this.f.confirmpassword.value)) {
      return;
    }
    this.loading = true;
    this.userService.changePassword(this.currentUser.username, this.f.newpassword.value, this.f.oldpassword.value).pipe()
      .subscribe(
        data => {          
          this.currentUser.passwordIsChanged = true;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          this.showSuccess('Change Password', 'Password has been changed successful.');
          this.closeChangePasswordDialog();
        },
        error => {
          this.error = error;
          this.loading = false;
        });
  }

  showSuccess(title: string,detail: string ) {
    this.snackBar.open(detail, title, { duration: 5000 });
  }


}
