import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/api/user/getall`);
  }

  changePassword(username: string, newPassword: string,oldPassword: string ) {
    return this.http.post<boolean>(
      `${environment.apiUrl}/api/user/changepassword`,
      { username, newPassword, oldPassword },
      this.httpOptions
    );
  }

  resetPassword(username: string, password: string) {
    return this.http.post<boolean>(
      `${environment.apiUrl}/api/user/resetpassword`,
      { username, password },
      this.httpOptions
    );
  }

  forgotpassword(username: string, password: string) {
    return this.http.post<boolean>(
      `${environment.apiUrl}/api/user/forgotpassword`,
      { username, password },
      this.httpOptions
    );
  }

  addUser(user: User) {
    return this.http.post<User>(`${environment.apiUrl}/api/user/adduser`,user);
  }

  updateUser(user: User) {
    return this.http.post<boolean>(`${environment.apiUrl}/api/user/updateuser`,user);
  }
  deleteUser(user: User){
    return this.http.post<boolean>(`${environment.apiUrl}/api/user/deleteuser`,user);
  }
}
