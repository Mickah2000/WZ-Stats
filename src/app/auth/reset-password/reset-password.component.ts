import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  user = {
    password: '',
    password2: '',
    token: ''
  };

  token: string;

  message: string;
  messageToDisplay: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService,
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: any) => {
      console.log('params:', params);
      this.token = params.token;
    })
  }

  async submit() {
    console.log(this.user);
    if (this.user.password !== this.user.password2) {
      this.messageToDisplay = "Les deux mots de passe doivent être identiques.";
      this.toast.error('Echec !', this.messageToDisplay);
      return
    }

    const PASSWORD_REGEX=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

    let testPassword = PASSWORD_REGEX.test(this.user.password);

    console.log('fonction submit', this.user.password);

    this.authService.resetPwd2(this.token, this.user.password, (err, res) => {
      console.log('---> ', res);
      if (!testPassword) {
        this.messageToDisplay = "Le mot de passe doit contenir obligatoirement : 8 caractères minimum, une lettre majuscule, un chiffre et un caractère spécial";
        this.toast.error('Echec !', this.messageToDisplay);
      } else {
        this.router.navigate(['/login']);
      }

    });
  }

  return() {
    this.router.navigate(['/login'])
  }

}
