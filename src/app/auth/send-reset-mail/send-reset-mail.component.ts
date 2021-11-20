import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-send-reset-mail',
  templateUrl: './send-reset-mail.component.html',
  styleUrls: ['./send-reset-mail.component.scss']
})
export class SendResetMailComponent implements OnInit {

  user = {
    email:''
  }

  constructor(private authService : AuthService, private router : Router) { }

  ngOnInit(): void {
  }

  submit(){
    console.log('fonction submit');
    
    this.authService.sendMail(this.user)
  }

  return(){
    this.router.navigate(['/login'])
  }

}
