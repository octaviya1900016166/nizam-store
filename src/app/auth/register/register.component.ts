import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  loading: boolean = false;
  showError: boolean = false;
  errorMessage: string = "";
  data: any = {};
  
  imgSrc: string = "assets/img/add-photo.png";
  imgUrl: string = "";
  selectedImage?: string;

  now: number = Date.now();


  constructor(
    private auth: AngularFireAuth,
    private fire: AngularFirestore,
    private router: Router,
    private storage: AngularFireStorage,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
  }

  simpanData() {
    this.auth.createUserWithEmailAndPassword(
      this.data.email,
      this.data.password
    ).then((resp) => {
      this.data['role'] = 'user';
      this.fire.collection('user').add(this.data);
      this.loading = false;
      this.router.navigateByUrl('/auth');
    }).catch((err) => {
      this.loading = false;
      this.errorMessage = err['message'];
      this.showError = true;
    })
  }

  getImage(url: any) {
    if(url.target.files && url.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (u: any) => this.imgSrc = u.target.result;
      reader.readAsDataURL(url.target.files[0]);
      this.selectedImage! = url.target.files[0];
      this.imgUrl = url.target.files[0]['name'];
    } else {
      this.imgSrc = "assets/img/add-image.png";
      this.selectedImage!;
    }
  }

  tapDaftar() {
    var filePath = `user/${this.imgUrl.split('.').slice(0, -1).join ('.')}_${new Date().getTime()}`;
    var fileRef = this.storage.ref(filePath);

    this.loading = true;
    this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(() => (
        fileRef.getDownloadURL().subscribe((url) => {
          this.data['poto_profile'] = url;
          this.data['created_at']  = this.datePipe.transform(this.now, 'MMM d, y, h:mm:ss a');

          this.simpanData();

        })
      ))
    ).subscribe()
  }

  closeAlert() {
    this.showError = false;
  }

}
