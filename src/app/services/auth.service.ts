import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";

interface AccessToken {
  access_token: string
}

interface Credentials {
  email: string
  password: string
}

interface Register {
  name: string
  firstname: string
  username: string
  email: string
  password: string
  role: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = 'http://localhost:9000/auth/login'
  url2 = 'http://localhost:9000/users'

  isloggedIn: Boolean = false;
  roleAs: string;

  helper = new JwtHelperService();

  user = {
    username: null,
    role: null
  }

  data: any;
  message: Object;

  constructor(private http: HttpClient, private router:Router) { }

  login(credentials: Credentials) {
    console.log(credentials)
    this.http.post<AccessToken>(this.url, credentials).subscribe(
      data => {
        const decodedToken = this.helper.decodeToken(data.access_token);
        console.log('a', decodedToken)  

        this.user.role = decodedToken.role;
        this.user.username = decodedToken.username
        
        localStorage.setItem('token', data.access_token)
        this.router.navigate(['/admin/dashboard'])
      },
      err => console.log(err)
    )
  }

  who() {
    const token = localStorage.getItem('token')
      let decodedToken = this.helper.decodeToken(token)
      let username = decodedToken.username
  }

  register(register: Register) {
    return this.http.put(this.url2, register)
  }

  isLoggedIn() {
    if (localStorage.getItem('token')) {
      return true;
    }
    this.router.navigate(['/admin'])
    return false;
  }

  logout() {
    localStorage.removeItem('token')
    this.router.navigate(['/login'])
  }

}
