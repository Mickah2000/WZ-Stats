import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  user = {
    password:''
  };

  token: string;

  constructor(
    private authService : AuthService, 
    private router : Router,
    private route: ActivatedRoute,
    ) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: any) => {
      console.log('params:', params);
      this.token = params.token;
    })
  }

  submit(){
    console.log('fonction submit', this.user.password);
    this.authService.resetPwd(this.token, this.user.password);
  }

  return(){
    this.router.navigate(['/login'])
  }

}
