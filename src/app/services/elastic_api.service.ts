import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElasticService {
  url = 'http://localhost:9000/'
  page = 'elastic'
  fullUrl = this.url + this.page

  constructor(private http: HttpClient) { }

  search(body) {
    return this.http.post(this.fullUrl, body);
  }

}