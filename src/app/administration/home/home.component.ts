import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  users: any[];
  id: number;
  message: string;

  constructor(private UserService: UserService, private router: Router) { }

  ngOnInit(): void {

    this.UserService.getUsers().subscribe(
      datas => {
        this.users = datas['data']
        console.log('users', this.users)
      },
      err => console.log(err)
    )
  }

  deleteUser(id) {
    console.log('id:', id);
    this.UserService.deleteUser(id).subscribe(
      data => {
        this.message = data['message']
        console.log(this.message)
        console.log('this.users: ', this.users);

        let found = this.users.find(user => user.id == id);

        let index = this.users.indexOf(found);
        console.log('index:', index);

        this.users.splice(index, 1);
        console.log(this.users)
      }
    )
  }

  createUser() {
    this.router.navigate(['/administration/create-user'])
  }

}


