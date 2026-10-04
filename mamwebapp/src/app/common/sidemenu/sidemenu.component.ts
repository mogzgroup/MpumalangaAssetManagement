import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../app/services/authentication.service';
import { User } from '../../../app/models/user.model';
import { Role } from 'src/app/models/role.model';

@Component({
  standalone: false,
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  currentUser: User;
  constructor(private router: Router,
    private authenticationService: AuthenticationService, private changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  navigate(url){
    this.router.navigate([url]);
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
  // ngOnDestroy() {
  //   if (!this.changeDetectionRef['destroyed']) {
  //     this.changeDetectionRef.detectChanges();
  //   }
  // }

}
