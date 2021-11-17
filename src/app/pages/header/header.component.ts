import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'app/services/admin.service';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, private AuthService : AuthService, private AdminService : AdminService) { }

  ngOnInit(): void {
  }

  isLoggedIn() {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  isAdmin() {
    if (this.AdminService.isAdmin()) {
      return true;
    }
    return false;
  }

  admin() {
    this.router.navigate(['/administration'])
  }

  logout() {
    localStorage.removeItem('token')
    this.router.navigate(['/login'])
  }

  dashboard() {
    this.router.navigate(['/admin'])
  }
}
