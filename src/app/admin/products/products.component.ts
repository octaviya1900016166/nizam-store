import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from "rxjs/operators";
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  product: any = {}
  dataUser: any = {}
  listData: any = {}

  imgSrc: string = "assets/img/add-photo.png";
  imgUrl: string = "";
  message: string = "Memuat data . . .";
  idProduct?: string;
  selectedImage?: string;
  now: number = Date.now();

  isEmpty: boolean = true;
  isAdmin: boolean = false;
  loading: boolean = false;
  isCollapsed: boolean = true;
  showMessage: boolean = false;

  category: any = [
    "Hadiah",
    "Piyama",
    "Jaket",
    "Kaos",
    "Aksesoris",
    "Tas Bayi",
  ]

  constructor(
    public auth: AngularFireAuth,
    public router: Router,
    private storage: AngularFireStorage,
    private fire: AngularFirestore,
    private datePipe: DatePipe
  ) { 
    this.checkUser();
  }

  ngOnInit(): void {
  }

  checkUser() {
    this.auth.authState.subscribe(resp => {
      if (!resp) {
        this.router.navigateByUrl('/auth')
      } else {
        this.fire.collection('user').ref.where('email', '==', resp!.email).onSnapshot(snapshot => {
          snapshot.forEach(ref => {
            this.dataUser = ref.data();
            if(this.dataUser.role == 'admin') {
              this.isAdmin = true;
            }
            this.getData();
          })
        })
      }
    })
  }

  produkBaru() {
    this.product = {};
    this.idProduct = undefined;
    this.imgSrc = "assets/img/add-photo.png";
    this.loading = false;
  }

  tapTambah() {
    this.loading = true;
    this.product['created_at'] = this.datePipe.transform(this.now, 'MMM d, y, h:mm:ss a');

    if(this.imgUrl == "") {
      this.fire.collection('product').doc(this.idProduct).update(this.product);
      this.produkBaru();
      this.showMessage = true;
    } else {
      var filePath = `product/${this.imgUrl.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;
      var fileRef = this.storage.ref(filePath);

      this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(() => (
          fileRef.getDownloadURL().subscribe((url) => {
            this.product['created_at'] = this.datePipe.transform(this.now, 'MMM d, y, h:mm:ss a');
            this.product['image_url'] = url;

            if(this.idProduct != null) {
              if(!this.isAdmin) {
                this.product['author'] = this.dataUser.username;
                this.product['phone'] = this.dataUser.phone;
              }
              this.fire.collection('product').doc(this.idProduct).update(this.product);
            } else {
              this.product['author'] = this.dataUser.username;
              this.product['phone'] = this.dataUser.phone;
              this.fire.collection('product').add(this.product);
            }
            this.showMessage = true;
            this.produkBaru();
          })
        ))
      ).subscribe()
    }
  }

  getImage(url: any) {
    if(url.target.files && url.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (u: any) => this.imgSrc = u.target.result;
      reader.readAsDataURL(url.target.files[0]);
      this.selectedImage! = url.target.files[0];
      this.imgUrl = url.target.files[0]['name'];
    } else {
      this.imgSrc = "assets/img/null-image.png";
      this.selectedImage!;
    }
  }

  getData() {
    if(this.isAdmin) {
      this.fire.collection('product', ref => ref.orderBy('created_at', 'desc')).snapshotChanges().subscribe((resp) => {
        this.listData = resp
        if (this.listData.length === 0) {
          this.message = "Data Kosong";
          this.isEmpty = true;
        }
        else {
          this.isEmpty = false;
        }
      })
    } else {
      this.fire.collection('product', ref => ref.where('author', '==', this.dataUser.username)).snapshotChanges().subscribe((resp) => {
        this.listData = resp
        if (this.listData.length === 0) {
          this.message = "Data Kosong";
          this.isEmpty = true;
        }
        else {
          this.isEmpty = false;
        }
      })
    }
  }

  getDetail(data: any, id: string) {
    this.idProduct = id;
    this.product = data;
    this.imgSrc = data['image_url'];
  }

  deleteProduct() {
    var _confirm = confirm("Yakin menghapus product ?");

    this.loading = true;
    
    if(_confirm) {
      this.fire
      .collection("product")
      .doc(this.idProduct)
      .delete().then(mod => {
        this.loading = false;
      });
    } else {
      this.loading = true;
    }
  }

  closeAlert() {
    this.showMessage = false;
  }

}
