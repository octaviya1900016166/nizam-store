import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  user: any = {};
  listUser: any = {};
  listProduct: any = {};

  totalUser: number = 0;
  totalProduct: number = 0;

  isEmptyProduct: boolean = true;

  constructor(
    private auth: AngularFireAuth,
    private fire: AngularFirestore
  ) { 
    this.getUser();
    this.getLength();
    this.getProduct();
  }

  ngOnInit(): void {
  }

  getLength() {
    this.fire.collection('user').snapshotChanges().subscribe((resp) => {
      this.totalUser = resp.length;
    })

    this.fire.collection('product').snapshotChanges().subscribe((resp) => {
      this.totalProduct = resp.length;
    })
  }

  getUser() {
    this.auth.authState.subscribe(resp => {
      this.fire.collection('user').ref.where('email', '==', resp!.email).onSnapshot(snapshot => {
        snapshot.forEach(ref => {
          this.user = ref.data()
        })
      })
    })
  }

  getProduct() {
    this.fire.collection('product', ref => (
      ref.orderBy('created_at', 'desc'),
      ref.limit(5)
    )).snapshotChanges().subscribe((resp) => {
      this.listProduct = resp;
      if(this.totalProduct != 0) {
        this.isEmptyProduct = false;
      } else {
        this.isEmptyProduct = true;
      }
    })
  }
}
