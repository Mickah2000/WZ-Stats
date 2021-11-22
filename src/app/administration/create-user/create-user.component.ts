import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  registration = {
    name: '',
    firstname: '',
    username: '',
    email: '',
    password: '',
    role: ''
  }

  message: string

  helper = new JwtHelperService();
  messageToDisplay: string;

  constructor(private AuthService: AuthService, private router: Router, private toast: ToastrService) { }

  ngOnInit(): void {

    const token = localStorage.getItem('token')
  }

  submit() {
    this.AuthService.register(this.registration).subscribe(
      data => {
        this.message = data['message'];
        setTimeout(redirect => this.router.navigate(['/administration']), 2000)
      },

      err => {
        this.messageToDisplay = "Les champs ne sont pas correctement remplis.";

        this.toast.error('Erreur !', this.messageToDisplay);
        console.log(err)
      }
    )
  }




}
