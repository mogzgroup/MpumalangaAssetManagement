import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { first } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';
import { AddUserComponent } from './add-user/add-user.component';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: false,
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class UserComponent implements OnInit {
  @ViewChild('resetPasswordDialog') resetPasswordDialog: TemplateRef<unknown>;
  @ViewChild('deleteUserDialog') deleteUserDialog: TemplateRef<unknown>;

  loading = false;
  resettingPassword = false;
  deleting = false;
  users: User[] = [];
  displayedColumns: string[] = ['name', 'surname', 'email', 'createdDate', 'role', 'department', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }
  error = '';
  resetUser: User;
  selectedUser: User;
  msgs: any[] = [];
  private confirmationDialogRef: MatDialogRef<unknown> | null = null;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (user, filter) => [
      user.name,
      user.surname,
      user.email,
      user.role?.name,
      user.department
    ].some(value => String(value ?? '').toLowerCase().includes(filter));
    this.dataSource.sortingDataAccessor = (user, property) => {
      const values: Record<string, string | number> = {
        name: user.name ?? '',
        surname: user.surname ?? '',
        email: user.email ?? '',
        createdDate: user.createdDate ? new Date(user.createdDate).getTime() : 0,
        role: user.role?.name ?? '',
        department: user.department ?? ''
      };
      return values[property] ?? '';
    };
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAll().pipe(first()).subscribe({
      next: users => {
        this.users = users ?? [];
        this.dataSource.data = [...this.users];
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.users = [];
        this.dataSource.data = [];
        this.loading = false;
        this.error = this.getErrorMessage(error);
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      }
    });
  }

  retryLoadUsers(): void {
    if (!this.loading) {
      this.loadUsers();
    }
  }

  applyFilter(value: string): void {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: 'min(92vw, 640px)',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100dvh - 24px)',
      panelClass: 'user-management-dialog',
      autoFocus: 'first-tabbable',
      data: { user, users: [...this.users] }
    });

    dialogRef.afterClosed().subscribe(savedUser => {
      if (!savedUser) {
        return;
      }
      const existingIndex = this.users.findIndex(item => item.id === savedUser.id);
      if (existingIndex >= 0) {
        this.users[existingIndex] = savedUser;
      } else {
        this.users.push(savedUser);
      }
      this.dataSource.data = [...this.users];
    });
  }

  editUser(user: User): void {
    this.openUserDialog(user);
  }

  confirmResetPassword(user: User): void {
    this.resetUser = user;
    this.openConfirmation(this.resetPasswordDialog);
  }

  confirmDelete(user: User = this.selectedUser): void {
    this.selectedUser = user;
    this.openConfirmation(this.deleteUserDialog);
  }

  private openConfirmation(template: TemplateRef<unknown>): void {
    this.confirmationDialogRef?.close();
    const dialogRef = this.dialog.open(template, {
      width: 'min(92vw, 440px)'
    });
    this.confirmationDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.confirmationDialogRef === dialogRef) {
        this.confirmationDialogRef = null;
      }
    });
  }

  closeConfirmation(): void {
    if (!this.deleting && !this.resettingPassword) {
      this.confirmationDialogRef?.close();
    }
  }

  resetPassword(): void {
    if (!this.resetUser) {
      return;
    }
    const generatedPassword = Math.random().toString(36).slice(-8);
    this.resettingPassword = true;
    if (this.confirmationDialogRef) {
      this.confirmationDialogRef.disableClose = true;
    }
    this.userService.resetPassword(this.resetUser.username, generatedPassword).pipe(first()).subscribe({
      next: isUpdated => {
        this.resettingPassword = false;
        if (isUpdated) {
          this.confirmationDialogRef?.close();
          this.showToast('Please check your email to reset the password.');
        } else {
          if (this.confirmationDialogRef) {
            this.confirmationDialogRef.disableClose = false;
          }
          this.showErrorToast('The password could not be reset. Please try again.');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.resettingPassword = false;
        if (this.confirmationDialogRef) {
          this.confirmationDialogRef.disableClose = false;
        }
        this.showErrorToast(this.getErrorMessage(error));
      }
    });
  }

  deleteUser(): void {
    if (!this.selectedUser || this.deleting) {
      return;
    }

    this.deleting = true;
    if (this.confirmationDialogRef) {
      this.confirmationDialogRef.disableClose = true;
    }
    this.userService.deleteUser(this.selectedUser).pipe(first()).subscribe({
      next: isDeleted => {
        this.deleting = false;
        if (!isDeleted) {
          if (this.confirmationDialogRef) {
            this.confirmationDialogRef.disableClose = false;
          }
          this.showErrorToast('The user was not deleted. Please try again.');
          return;
        }

        const deletedId = this.selectedUser.id;
        this.users = this.users.filter(user => user.id !== deletedId);
        this.dataSource.data = [...this.users];
        this.keepPaginatorOnValidPage();
        this.confirmationDialogRef?.close();
        this.showToast('User deleted successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.deleting = false;
        if (this.confirmationDialogRef) {
          this.confirmationDialogRef.disableClose = false;
        }
        this.showErrorToast(this.getErrorMessage(error));
      }
    });
  }

  private keepPaginatorOnValidPage(): void {
    const paginator = this.dataSource.paginator;
    if (!paginator) {
      return;
    }
    const lastPageIndex = Math.max(0, Math.ceil(this.dataSource.filteredData.length / paginator.pageSize) - 1);
    paginator.pageIndex = Math.min(paginator.pageIndex, lastPageIndex);
  }

  showToast(message: string): void {
    this.toastService.showSuccess(message);
  }

  showErrorToast(message: string): void {
    this.toastService.showError(message);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Check your connection and try again.';
      case 400:
        return 'The request contains invalid details. Review the information and try again.';
      case 401:
      case 403:
        return 'You are not authorized to manage users.';
      case 404:
        return 'The requested user could not be found.';
      case 409:
        return 'This operation conflicts with an existing user record.';
      default:
        return error.status >= 500
          ? 'The server could not complete your request. Please try again later.'
          : 'The request could not be completed. Please try again.';
    }
  }
}
