import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  user = {
    email:''
  }

  constructor(private router : Router) { }

  ngOnInit(): void {
  }

  submit(){
    
  }

  return(){
    this.router.navigate(['/login'])
  }

}
