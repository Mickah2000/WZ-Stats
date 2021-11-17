import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = 'http://localhost:9000/'
  page = 'users'
  fullUrl = this.url + this.page

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get(this.fullUrl)  
  }

  // getUser(id) {
  //   return this.http.get(this.fullUrl+'/'+ id)  
  // }

  deleteUser(id) {
    return this.http.delete(this.fullUrl+'/'+ id)
  }
}