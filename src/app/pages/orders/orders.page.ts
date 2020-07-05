import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})

export class OrdersPage implements OnInit {
  seg_id = 1;
  readyOrders: any[] = [];
  orders: any[] = [];
  oldOrders: any;
  dummy = Array(50);

  constructor(
    private router: Router,
    private api: ApiService,
    private util: UtilService,
    private adb: AngularFirestore) {
      if (localStorage.getItem('uid')) {
        this.adb.collection('orders', ref =>
          ref.where('driverId', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
            console.log('paylaoddddd----->>>>', data);
            if (data) {
              this.getReadyOrders();
              this.getOrders();
            }
          }, error => {
            console.log(error);
          });
      }
  }

  ngOnInit() {
  }

  onClick(val) {
    this.seg_id = val;
  }

  getReadyOrders() {
    this.readyOrders = [];
    return this.api.getReadyOrders().then((data: any) => {
      this.dummy = [];
      console.log(data);
      if (data) {
        this.readyOrders = [];
        data.forEach(element => {
          element.order = JSON.parse(element.order);
          this.readyOrders.push(element);
        });
      }
    }).catch(error => {
      this.dummy = [];
      console.log('eror', error);
    });
  }

  getOrders() {
    this.orders = [];
    this.oldOrders = [];
    return this.api.getMyOrders(localStorage.getItem('uid')).then((data: any) => {
      this.dummy = [];
      console.log('My orders');
      console.log(data);
      if (data) {
        this.orders = [];
        this.oldOrders = [];
        data.forEach(element => {
          element.order = JSON.parse(element.order);
          if (element.status === 'delivered' || element.status === 'cancel' || element.status === 'rejected') {
            this.oldOrders.push(element);
          } else {
            this.orders.push(element);
          }
        });
      }
    }).catch(error => {
      this.dummy = [];
      console.log('eror', error);
    });
  }

  goToOrderDetail(ids) {
    const navData: NavigationExtras = {
      queryParams: {
        id: ids
      }
    };
    this.router.navigate(['/order-detail'], navData);
  }

  getProfilePic(item) {
    return item && item.cover ? item.cover : 'assets/imgs/user.jpg';
  }

  doRefresh(event) {
    Promise.all([
      this.getReadyOrders(),
      this.getOrders(),
    ]).then(()=>{
      event.target.complete();
    });
  }
}
