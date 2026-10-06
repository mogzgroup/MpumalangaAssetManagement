import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../app/services/authentication.service';
import { User } from '../app/models/user.model';
import { OnInit } from '@angular/core';
import { HeaderComponent } from './common/header/header.component';
import { ToastContainerComponent } from './common/toast-container/toast-container.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./app.component.css'],
    imports: [HeaderComponent, RouterOutlet, ToastContainerComponent]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private authenticationService = inject(AuthenticationService);
  private dialog = inject(MatDialog);

  currentUser: User;
  loggedIn = false;
  navigationExpanded = true;

  setNavigationExpanded(expanded: boolean) {
    this.navigationExpanded = expanded;
  }

  get isLoginRoute(): boolean {
    return this.router.url.split('?')[0] === '/login';
  }

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(() => {
      this.dialog.closeAll();
    });
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
      this.loggedIn = this.authenticationService.isAuthenticated;
      const currentPath  = this.location.path();

      if (currentPath === '/reportfault') {
        return;
      }

      if(!this.loggedIn){
        this.router.navigate(['login']);
      }
    }
    );
  }

  ngOnInit() {
}

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin() {
    if(this.currentUser.role != null)
      return this.currentUser && (this.currentUser.role.id === 2 || this.currentUser.role.id === 4);
    else
      return false;
  }

  isDepartmantUser() {
    if(this.currentUser.role != null)
      return this.currentUser && (this.currentUser.role.id === 7);
    else
      return false;
  }
}
