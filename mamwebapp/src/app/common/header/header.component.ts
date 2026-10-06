import { AfterViewInit, Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, EventEmitter, HostListener, Output, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/models/user.model';
import { ToastService } from 'src/app/services/toast.service';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatPrefix, MatSuffix, MatError, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconButton, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem, SidemenuComponent, MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatPrefix, MatInput, MatSuffix, MatError, MatHint, MatDialogActions, MatButton, MatProgressSpinner, UpperCasePipe]
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private authenticationService = inject(AuthenticationService);

  @Output() navigationExpandedChange = new EventEmitter<boolean>();
  mobileNavOpen = false;
  @ViewChild('changePasswordDialog') changePasswordDialog: TemplateRef<unknown>;
  @ViewChild('mobileNavigationToggle') mobileNavigationToggle: ElementRef<HTMLButtonElement>;
  showSettings = false;
  showDialog = false;
  changePasswordForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  currentUser: User;
  showSideMenu = true;
  newPassword = '';
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  private passwordDialogRef: MatDialogRef<unknown> | null = null;

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
      if (this.currentUser && !this.currentUser.passwordIsChanged)
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

  toggleDesktopNavigation() {
    this.showSideMenu = !this.showSideMenu;
    this.navigationExpandedChange.emit(this.showSideMenu);
  }

  toggleMobileNavigation() {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNavigation() {
    this.mobileNavOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeMobileNavigationOnEscape() {
    if (!this.mobileNavOpen) {
      return;
    }
    this.closeMobileNavigation();
    this.mobileNavigationToggle?.nativeElement.focus();
  }

  get displayName(): string {
    return [this.currentUser?.name, this.currentUser?.surname].filter(Boolean).join(' ');
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
        width: 'min(92vw, 500px)',
        maxWidth: 'calc(100vw - 24px)',
        panelClass: 'password-change-dialog',
        autoFocus: 'first-tabbable',
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
          this.toastService.showSuccess('Password changed successfully.');
          this.closeChangePasswordDialog();
        },
        () => {
          this.toastService.showError('Unable to change your password. Please try again.');
          this.loading = false;
        });
  }

}
