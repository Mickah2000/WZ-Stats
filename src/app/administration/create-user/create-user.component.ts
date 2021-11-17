import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  registration = {
    name:'',
    firstname: '',
    username: '',
    email: '',
    password: '',
    role:''
  }
  
  message: string

  helper = new JwtHelperService();

  constructor(private AuthService: AuthService, private router: Router) { }

  ngOnInit(): void {

    const token = localStorage.getItem('token')
  }
  
  // submit() {
    //   this.authService.register(this.registration)
    // }
    
  submit() {
    this.AuthService.register(this.registration).subscribe(
      data => {
        this.message = data['message'];
        setTimeout(redirect => this.router.navigate(['/administration']), 2000 ) 
      },
      err => {
        console.log(err) // traitement erreur
      }
    )
  }


}
