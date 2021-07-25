import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { finalize } from "rxjs/operators";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  isAdmin: boolean = false;
  loading: boolean = false;
  isCollapsed: boolean = true;
  showMessage: boolean = false;

  listUser: any = {};
  user: any = {};
  
  imgSrc: string = "assets/img/add-photo.png";

  selectedImage?: string;
  imgUrl?: string;
  idUser?: string;

  now: number = Date.now();

  constructor(
    public auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private fire: AngularFirestore,
    private datePipe: DatePipe,
    router: Router
  ) {

    auth.authState.subscribe(resp => {
      if (!resp) {
        router.navigateByUrl('/auth')
      } else {
        fire.collection('user').ref.where('email', '==', resp!.email).onSnapshot(snapshot => {
          snapshot.forEach(ref => {
            this.user = ref.data();
            if(this.user.role == 'admin') {
              this.isAdmin = true;
            }
            this.getData();
          })
        })
      }
    })
   }

  ngOnInit(): void {
  }

  newUser() {
    this.user = {};
    this.idUser = undefined;
    this.imgSrc = "assets/img/add-photo.png";
    this.loading = false;
  }

  getData() {
    this.fire.collection('user', ref => ref.orderBy('role')).snapshotChanges().subscribe((resp) => {
      this.listUser = resp
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

  tapSave() {
    this.loading = true;
    this.user['created_at'] = this.datePipe.transform(this.now, 'MMM d, y, h:mm:ss a');

    if(this.imgUrl == "") {
      this.fire.collection('user').doc(this.idUser).update(this.user);
      this.showMessage = true;
      this.newUser();
    } else {
      var filePath = `user/${this.imgUrl!.split('.').slice(0, -1).join ('.')}_${new Date().getTime()}`;
      var fileRef = this.storage.ref(filePath);

      this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(() => (
          fileRef.getDownloadURL().subscribe((url) => {
            this.user['poto_profile'] = url;
            this.user['created_at']  = this.datePipe.transform(this.now, 'MMM d, y, h:mm:ss a');

            this.fire.collection('user').doc(this.idUser).update(this.user);
            this.showMessage = true;
            this.newUser();
          })
        ))
      ).subscribe()
    }
  }

  tapDetail(data: any, id: string) {
    this.idUser = id;
    this.user = data;
    this.imgSrc = data['poto_profile'];
  }

  deleteUser() {
    var _confirm = confirm("Apakah anda yakin ingin menghapus akun ini ? \n User akan otomatis logout.");

    if(_confirm) {
      this.auth.signInWithEmailAndPassword(this.user.email, this.user.password).then(resp => {
        resp.user?.delete();
        this.fire
        .collection("user")
        .doc(this.idUser)
        .delete().then(mod => {
          this.loading = false;
        });
      })
    }


  }

  closeAlert() {
    this.showMessage = false;
  }

}
