import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { environment } from './../../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { AdminComponent } from './admin.component';
import { FlexLayoutModule } from '@angular/flex-layout';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'product-list',
        component: ProductsComponent
      },
      {
        path: 'user',
        component: UsersComponent
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
]

@NgModule({
  declarations: [
    DashboardComponent,
    ProductsComponent,
    UsersComponent,
    AdminComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    FlexLayoutModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    DatePipe
  ],

})
export class AdminModule { }
