import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../../models/user.model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserService } from '../../../services/user/user.service';
import { ToastService } from '../../../services/toast.service';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export interface AddUserDialogData {
  user?: User;
  users: User[];
}

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./add-user.component.css'],
    imports: [MatDialogTitle, MatIcon, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatError, MatSelect, MatOption, MatDialogActions, MatButton, MatProgressSpinner]
})
export class AddUserComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private authenticationService = inject(AuthenticationService);
  private toastService = inject(ToastService);
  readonly dialogRef = inject<MatDialogRef<AddUserComponent, User | undefined>>(MatDialogRef);
  readonly data = inject<AddUserDialogData>(MAT_DIALOG_DATA);

  readonly roles = [
    { name: 'Viewer', code: 'V', factor: 1 },
    { name: 'Administrator', code: 'SA', factor: 2 },
    { name: 'Capturer', code: 'C', factor: 3 },
    { name: 'Approver', code: 'A', factor: 5 },
    { name: 'Verifier', code: 'DV', factor: 4 },
    { name: 'Manager', code: 'M', factor: 6 },
    { name: 'Department user', code: 'D', factor: 7 },
  ];

  readonly departments = [
    { name: 'Agriculture, rural development, land & environmental affairs', code: 'ARALEA', factor: 1 },
    { name: 'Economic development & tourism', code: 'EDT', factor: 2 },
    { name: 'Co-operative governance & traditional affairs', code: 'CGTA', factor: 3 },
    { name: 'Community safety, security & liason', code: 'CSSL', factor: 4 },
    { name: 'Culture, sport & recreation', code: 'CSR', factor: 5 },
    { name: 'Education', code: 'E', factor: 6 },
    { name: 'Provincial treasury', code: 'PT', factor: 7 },
    { name: 'Health', code: 'H', factor: 8 },
    { name: 'Human settlements', code: 'HS', factor: 9 },
    { name: 'Social development', code: 'SD', factor: 10 },
    { name: 'Public works, roads & transport', code: 'PWRT', factor: 11 },
    { name: 'Finance', code: 'F', factor: 11 },
  ];

  addUserForm: FormGroup;
  submitted = false;
  saving = false;
  selectedRole = 0;
  readonly isEditMode: boolean;

  constructor() {
    const data = this.data;

    this.isEditMode = !!data.user;
  }

  ngOnInit(): void {
    const user = this.data.user;
    const role = this.roles.find(item => item.factor === user?.roleId) ?? null;
    const department = this.departments.find(item => item.name === user?.department) ?? null;
    this.selectedRole = role?.factor ?? 0;

    this.addUserForm = this.formBuilder.group({
      name: [user?.name ?? '', Validators.required],
      surname: [user?.surname ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      role: [role, Validators.required],
      department: [department]
    });
  }

  get f() {
    return this.addUserForm.controls;
  }

  setRole(role: { factor: number } | null): void {
    this.selectedRole = role?.factor ?? 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.saving || this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    const email = String(this.f.email.value).trim();
    const duplicate = this.data.users.some(user =>
      user.email?.toLowerCase() === email.toLowerCase() && user.id !== this.data.user?.id
    );
    if (duplicate) {
      this.f.email.setErrors({ ...this.f.email.errors, duplicate: true });
      this.f.email.markAsTouched();
      return;
    }

    this.saving = true;
    const selectedRole = this.f.role.value;
    const selectedDepartment = this.f.department.value;
    const currentUser = this.authenticationService.currentUserValue;
    const user: User = {
      ...(this.data.user ?? {} as User),
      id: this.data.user?.id,
      username: email,
      password: this.data.user?.password ?? Math.random().toString(36).slice(-8),
      name: String(this.f.name.value).trim(),
      surname: String(this.f.surname.value).trim(),
      roleId: selectedRole.factor,
      role: selectedRole,
      department: selectedDepartment?.name ?? null,
      isActive: this.data.user?.isActive ?? true,
      email,
      passwordIsChanged: this.data.user?.passwordIsChanged ?? false,
      createdDate: this.data.user?.createdDate ?? new Date(),
      createdUserId: this.data.user?.createdUserId ?? currentUser?.id
    };

    const handleError = (error: HttpErrorResponse) => {
      this.toastService.showError(this.getErrorMessage(error));
      this.saving = false;
    };
    const handleFailure = () => {
      this.toastService.showError(this.isEditMode
        ? 'The user could not be updated. Please check the details and try again.'
        : 'The user could not be added. Please check the details and try again.');
      this.saving = false;
    };

    if (this.isEditMode) {
      this.userService.updateUser(user).subscribe({
        next: updated => updated ? this.finishSave(user) : handleFailure(),
        error: handleError
      });
      return;
    }

    this.userService.addUser(user).subscribe({
      next: created => created && created.id !== 0 ? this.finishSave(created) : handleFailure(),
      error: handleError
    });
  }

  private finishSave(user: User): void {
    this.toastService.showSuccess(this.isEditMode ? 'User updated successfully.' : 'User added successfully.');
    this.dialogRef.close(user);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Check your connection and try again.';
      case 400:
        return 'Some of the user details are invalid. Review the form and try again.';
      case 401:
      case 403:
        return 'You are not authorized to manage users.';
      case 404:
        return 'The user service could not be found. Please try again later.';
      case 409:
        return 'A user with these details already exists.';
      default:
        return error.status >= 500
          ? 'The server could not complete your request. Please try again later.'
          : 'Unable to save the user. Please try again.';
    }
  }
}
