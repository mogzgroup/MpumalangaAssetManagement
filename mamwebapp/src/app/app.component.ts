import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../app/services/authentication.service';
import { User } from '../app/models/user.model';
import { Role } from '../app/models/role.model';
import { OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentUser: User;
  loggedIn: boolean = false;
  navigationExpanded = true;

  setNavigationExpanded(expanded: boolean) {
    this.navigationExpanded = expanded;
  }

  get isLoginRoute(): boolean {
    return this.router.url.split('?')[0] === '/login';
  }

  constructor(
    private router: Router,
    private location: Location,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog
  ) {
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
