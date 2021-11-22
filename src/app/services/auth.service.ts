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

interface sendMail {
  email: string
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
  api_url = 'http://localhost:9000/';

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

  login(credentials: Credentials, cb) {
    console.log(credentials)
    this.http.post<AccessToken>(this.api_url + 'auth/login', credentials).subscribe(
      data => {
        const decodedToken = this.helper.decodeToken(data.access_token);
        console.log('a', decodedToken)  

        this.user.role = decodedToken.role;
        this.user.username = decodedToken.username
        
        localStorage.setItem('token', data.access_token)
        cb(null, data);
      },
      err => {
        console.error(err);        
        cb(err, null);
      }
    )
  }

  sendMail(sendMail: sendMail) {
    console.log(sendMail)
    this.http.post(this.api_url + 'send-mail', sendMail).subscribe()
  }

  // async resetPwd(token: string, password: string): Promise<any> {
  //   console.log(password)
  //   this.http.patch(this.api_url + 'reset-password', {token: token, password: password}).subscribe(
  //   {
  //     next: (
  //       res => {
  //       console.log(res);
  //       Promise.resolve(res);
  //     }),
  //     error (msg) {
  //       console.log('err:', msg);
  //       return Promise.reject(msg);
  //     }
  //   }
  //   )
  // }

  resetPwd2 (token: string, password: string, cb) {
    this.http.patch(this.api_url + 'reset-password', {token: token, password: password}).subscribe(res => {
      console.log(res);
      cb(null, res);
    });
  }

  who() {
    const token = localStorage.getItem('token')
      let decodedToken = this.helper.decodeToken(token)
      let username = decodedToken.username
  }

  register(register: Register) {
    return this.http.post(this.api_url + 'users', register)
    
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
