import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user = {
    email:'',
    password:''
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  submit() {
    this.authService.login(this.user)
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

//   // Vérification si les champ qu'il est bien tout remplie
//   if (user.email == '' || user.password == '') {
//       return `<div>Le formulaire n'est pas correctement rempli</div>`
//       test = false
//   }


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