import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../../models/user.model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserService } from '../../../services/user/user.service';
import { AddUserComponent, AddUserDialogData } from './add-user.component';
import { ToastService } from '../../../services/toast.service';

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let userService: jasmine.SpyObj<UserService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AddUserComponent, User | undefined>>;
  let toastService: jasmine.SpyObj<ToastService>;
  let data: AddUserDialogData;

  const existingUser: User = {
    id: 42,
    username: 'current@example.com',
    password: 'existing-password',
    name: 'Current',
    surname: 'User',
    roleId: 1,
    role: { id: 1, name: 'Viewer', description: '' },
    isActive: true,
    email: 'current@example.com',
    passwordIsChanged: true,
    createdDate: new Date('2024-01-01'),
    createdUserId: 3,
    department: null
  };

  beforeEach(() => {
    userService = jasmine.createSpyObj<UserService>('UserService', ['addUser', 'updateUser']);
    dialogRef = jasmine.createSpyObj<MatDialogRef<AddUserComponent, User | undefined>>('MatDialogRef', ['close']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', [
      'showSuccess', 'showError', 'showWarning', 'showInfo', 'getApiErrorMessage'
    ]);
    toastService.getApiErrorMessage.and.returnValue('The request could not be completed. Please try again.');
    data = { users: [existingUser] };
    component = new AddUserComponent(
      new FormBuilder(),
      userService,
      { currentUserValue: { id: 3 } } as AuthenticationService,
      toastService,
      dialogRef,
      data
    );
    component.ngOnInit();
  });

  it('creates with an empty add form', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.addUserForm.invalid).toBe(true);
  });

  it('prepopulates an edit form and updates the selected user', () => {
    data.user = existingUser;
    component = new AddUserComponent(
      new FormBuilder(),
      userService,
      { currentUserValue: { id: 3 } } as AuthenticationService,
      toastService,
      dialogRef,
      data
    );
    component.ngOnInit();
    userService.updateUser.and.returnValue(of(true));

    expect(component.addUserForm.value).toEqual(jasmine.objectContaining({
      name: existingUser.name,
      surname: existingUser.surname,
      email: existingUser.email
    }));
    component.onSubmit();

    expect(userService.updateUser).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ id: existingUser.id }));
  });

  it('rejects duplicate emails before making an API request', () => {
    component.addUserForm.setValue({
      name: 'Another',
      surname: 'User',
      email: existingUser.email,
      role: component.roles[0],
      department: null
    });

    component.onSubmit();

    expect(component.f.email.hasError('duplicate')).toBe(true);
    expect(userService.addUser).not.toHaveBeenCalled();
  });

  it('shows a friendly authorization error and allows retry after API failure', () => {
    component.addUserForm.setValue({
      name: 'New',
      surname: 'User',
      email: 'new@example.com',
      role: component.roles[0],
      department: null
    });
    userService.addUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

    component.onSubmit();

    expect(toastService.showError).toHaveBeenCalledWith('You are not authorized to manage users.');
    expect(component.saving).toBe(false);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
