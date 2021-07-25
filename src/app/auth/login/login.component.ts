import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  login: any = {};
  loading: boolean = false;
  errorMessage?: String;
  showError: boolean = false;

  constructor(
    public auth: AngularFireAuth,
    private route: Router,
  ) { 
    auth.authState.subscribe(resp => {
      if (resp) {
        route.navigateByUrl('/admin')
      }
    })
  }

  ngOnInit(): void {
  }

  tapLogin() {
    this.loading = true;
    this.auth.signInWithEmailAndPassword(
      this.login.email,
      this.login.password
    ).then((resp) => {
      this.loading = false;
    }).catch((err) => {
      this.loading = false;
      switch (err['code']) {
        case 'auth/invalid-email':
          this.errorMessage = 'Email anda salah !';
          break;
        case 'auth/user-not-found':
          this.errorMessage = 'User tidak ditemukan !';
          break;
        default:
          this.errorMessage = 'Periksa kembali data anda !';
          console.log(err)
          break;
      }
      this.showError = true;

    })
  }

  closeAlert() {
    this.showError = false;
  }

}
