import { Component, EventEmitter, Input, OnInit, ChangeDetectionStrategy, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../app/services/authentication.service';
import { User } from '../../../app/models/user.model';

import { MatNavList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-sidemenu',
    templateUrl: './sidemenu.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sidemenu.component.css'],
    imports: [MatNavList, MatListItem, MatTooltip, MatIcon, MatListItemIcon, MatListItemTitle]
})
export class SidemenuComponent implements OnInit {
  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  @Input() expanded = true;
  @Input() mobileOpen = false;
  @Output() navigationRequested = new EventEmitter<void>();

  currentUser: User;

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  navigate(url: string) {
    this.router.navigate([url]);
    this.navigationRequested.emit();
  }

  isActive(url: string): boolean {
    return this.router.url.split('?')[0].toLowerCase().startsWith(`/${url.toLowerCase()}`);
  }

  isAdmin() {
    if(this.currentUser != null)
    {
      if(this.currentUser.role != null)
        return this.currentUser && (this.currentUser.role.id === 2);
      else
        return false;
    }else
      return false;
  }

  isDepartmantUser() {
    if(this.currentUser != null)
    {
    if(this.currentUser.role != null)
      return this.currentUser && (this.currentUser.role.id === 7);
    else
      return false;
    }else
    return false;
  }
}
