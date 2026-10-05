import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';
import { AddUserComponent } from './add-user/add-user.component';
import { UserComponent } from './user.component';
import { ToastService } from '../../services/toast.service';

describe('UserComponent', () => {
  let component: UserComponent;
  let userService: jasmine.SpyObj<UserService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<unknown>>;
  let dialogClosed: Subject<void>;

  const firstUser: User = {
    id: 1,
    username: 'first@example.com',
    password: '',
    name: 'First',
    surname: 'User',
    roleId: 1,
    role: { id: 1, name: 'Viewer', description: '' },
    isActive: true,
    email: 'first@example.com',
    passwordIsChanged: true,
    createdDate: new Date('2024-01-01'),
    createdUserId: 2,
    department: null
  };

  beforeEach(() => {
    userService = jasmine.createSpyObj<UserService>('UserService', ['getAll', 'deleteUser', 'resetPassword']);
    userService.getAll.and.returnValue(of([firstUser]));
    userService.deleteUser.and.returnValue(of(true));
    userService.resetPassword.and.returnValue(of(true));
    toastService = jasmine.createSpyObj<ToastService>('ToastService', [
      'showSuccess', 'showError', 'showWarning', 'showInfo', 'getApiErrorMessage'
    ]);
    toastService.getApiErrorMessage.and.returnValue('Unable to connect to the server. Please check your connection and try again.');
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogClosed = new Subject<void>();
    dialogRef = jasmine.createSpyObj<MatDialogRef<unknown>>('MatDialogRef', ['close', 'afterClosed']);
    dialogRef.afterClosed.and.returnValue(dialogClosed);
    dialog.open.and.returnValue(dialogRef);
    component = new UserComponent(userService, toastService, dialog);
    component.ngOnInit();
  });

  it('loads users and initializes table data', () => {
    expect(component.users).toEqual([firstUser]);
    expect(component.dataSource.data).toEqual([firstUser]);
    expect(component.loading).toBe(false);
  });

  it('keeps the row and confirmation open when delete fails', () => {
    userService.deleteUser.and.returnValue(of(false));
    component.confirmDelete(firstUser);

    component.deleteUser();

    expect(component.users).toEqual([firstUser]);
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.deleting).toBe(false);
    expect(toastService.showError).toHaveBeenCalled();
  });

  it('removes a user only after a successful delete response', () => {
    component.confirmDelete(firstUser);

    component.deleteUser();

    expect(component.users).toEqual([]);
    expect(component.dataSource.data).toEqual([]);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('updates the table locally after the add/edit dialog succeeds', () => {
    const updatedUser = { ...firstUser, name: 'Updated' };
    dialog.open.and.returnValue({
      afterClosed: () => of(updatedUser)
    } as ReturnType<MatDialog['open']>);
    component.dataSource.filter = 'updated';

    component.openUserDialog(firstUser);

    expect(dialog.open).toHaveBeenCalledWith(AddUserComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ user: firstUser })
    }));
    expect(component.users[0].name).toBe('Updated');
    expect(component.dataSource.filter).toBe('updated');
  });

  it('shows a friendly message for a failed delete request', () => {
    userService.deleteUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.confirmDelete(firstUser);

    component.deleteUser();

    expect(component.users).toEqual([firstUser]);
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(toastService.showError).toHaveBeenCalledWith('Unable to reach the server. Check your connection and try again.');
  });
});
