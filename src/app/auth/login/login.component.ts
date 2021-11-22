import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user = {
    email: '',
    password: ''
  }

  email: string
  password: string
  messageToDisplay: string = null;

  constructor(private authService: AuthService, private router: Router, private toast: ToastrService) { }

  ngOnInit(): void {
  }

  submit() {
    this.authService.login(this.user, (err, res) => {
      console.log(err, res);
      if (err) {
        console.error(err);
        // display message
        this.messageToDisplay = "Erreur de connexion !";
        this.toast.error('Echec !', 'Erreur de connexion !');
      } else {
        // display message
        this.messageToDisplay = "Vous êtes connecté !";
        
        this.toast.success('Succès !', this.messageToDisplay);

        setTimeout(() => {
          this.router.navigate(['/admin/dashboard'])
        }, 1000);
      }

    })
  }

  resetPassword() {
    this.router.navigate(['/reset-password'])
  }

}

// // Gestion des erreurs
// let error = document.querySelector('#form_error')
// let message = ''
// let test = true

// // Mise en place des éléments
// let pseudo = document.querySelector('#pseudo')
// let pass = document.querySelector('#password')
// let confirme = document.querySelector('#confirme')
// let email = document.querySelector('#email')
// let regex = new RegExp('^[A-Z][a-z0-9]+[A-Z][a-z0-9]+[^A-Za-z0-9]$')
// let regexEmail = new RegExp('^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')

// // Lors de la soumission du formulaire
// form.addEventListener('submit', (e) => {
//   // Blocage de la soumission
//   e.preventDefault()

//   // Reset des messages derreur et du flag
//   message = ''
//   test = true




//   // Le truc qui taille de la bonne longueur que c'est celle que je veut, sa mère.
//   if (user.password.length < 8) {
//       return `<div>Le mot de passe doit être de 8 caractères minimum</div>`
//       test = false
//   }

//   // Le truc ki taille 1 Majuscule début, milieu et caractaire spécial quand c la fin
//   if(!regex.test(user.password)){
//       return `<div>Le mot de passe doit comporter une majuscule au début, une majuscule au milieu et 1 caractère spécial à la fin</div>`
//       test = false
//   }

//   // Email identifiant remplacant le pseudo
//   if(!regexEmail.test(user.email)){
//       return `<div>Le format de votre email est incorrect.</div>`
//   }