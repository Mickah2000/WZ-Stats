import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  helper = new JwtHelperService();

  constructor(private router: Router) { }

  isAdmin() {
    const token = localStorage.getItem('token')
      let decodedToken = this.helper.decodeToken(token)
      let role = decodedToken.role

      if(!!token && role === '15vfdgr') {
        return true
      }
      return false
  }
}
