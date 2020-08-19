import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})

export class OrderDetailPage implements OnInit {
  tab_id;
  id: any;
  grandTotal: any;
  orders: any[] = [];
  serviceTax: any;
  deliveryCharge: any;
  minimumPurchaseCharge: any = 0;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  restName: any;
  deliveryAddress: any;
  username: any;
  useremail: any;
  userphone: any;
  usercover: any;
  payment: any;
  myname: any;
  token: any;
  changeStatusOrder: any;
  loaded: boolean;
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private util: UtilService,
    private navCtrl: NavController) {
    this.loaded = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log(data);
      this.tab_id = data.id;
      this.id = data.id;
      this.getOrder();
    });
  }

  getOrder() {
    // this.util.show();
    console.log(`get order by id: ${this.id}`);
    this.api.getOrderById(this.id).then((data) => {
      // this.util.hide();
      this.loaded = true;
      console.log(`Order id: ${this.id}`);
      console.log(data);
      if (data) {
        this.grandTotal = data.grandTotal;
        this.orders = JSON.parse(data.order);
        this.serviceTax = data.serviceTax;
        this.deliveryCharge = data.deliveryCharge;
        this.minimumPurchaseCharge = data.minimumPurchaseCharge;
        this.status = data.status;
        this.time = data.time;
        this.total = data.total;
        this.address = data.vid.address;
        this.restName = data.vid.name;
        this.deliveryAddress = data.address.address;
        this.username = data.uid.fullname;
        this.useremail = data.uid.email;
        this.userphone = data.uid.phone;
        this.usercover = data.uid && data.uid.cover ? data.uid.cover : 'assets/imgs/user.jpg';;
        this.payment = data.paid;
        this.myname = data.dId ? data.dId.fullname: '';
        this.token = data.uid.fcm_token;
        console.log('this', this.orders);
      }
    }).catch(error => {
      console.log('error in order', error);
      // this.util.hide();
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  changeStatus(status) {
    this.util.show();
    const userId = localStorage.getItem('uid');
    this.api.updateOrderStatus(this.id, status, userId).then((data) => {
      console.log('data', data);
      const msg = this.util.translate('Your Order is ') + this.util.translate(status) + this.util.translate(' By ') + this.restName;
      if (status === 'delivered' || status === 'cancel') {
        const parm = {
          current: 'active',
        };
        this.api.updateProfile(userId, parm).then((data) => {
          console.log('driver status cahcnage----->', data);
        }).catch(error => {
          console.log(error);
        });
      }
      this.api.sendNotification(msg, 'Order ' + status, this.token).subscribe((data) => {
        console.log(data);
        this.util.hide();
      }, error => {
        this.util.hide();
        console.log('err', error);
      });
      this.util.publishNewAddress('hello');
      Swal.fire({
        title: this.util.translate('success'),
        text: this.util.translate('Order status changed to ') + this.util.translate(status),
        icon: 'success',
        timer: 2000,
        backdrop: false,
        background: 'white'
      });
      this.navCtrl.navigateRoot(['/tabs/tab1']);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.navCtrl.navigateRoot(['/tabs/tab1']);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  changeOrderStatus(status) {
    console.log('order status', status);
    if (status) {
      this.changeStatus(status);
    }
  }

  goToTracker() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
  }

  call() {
    // window.open('https://api.whatsapp.com/send?phone=91' + this.userphone);
    window.open('tel:' + this.userphone);
  }

  mail() {
    window.open('mailto:' + this.useremail);
  }

  back() {
    this.util.publishNewAddress('hello');
    this.navCtrl.back();
  }

  picked() {
    this.util.show();
    const userId = localStorage.getItem('uid');
    this.api.updateOrderStatus(this.id, 'ongoing', userId).then((data) => {
      console.log(data);
      this.util.hide();
      const msg = this.myname + this.util.translate(' Picked up your order');
      this.api.sendNotification(msg, this.util.translate('Order Picked'), this.token).subscribe(data => {
        console.log(data);
      });
      this.navCtrl.back();
      this.util.publishNewAddress('hello');
      Swal.fire({
        title: 'success',
        text: this.util.translate('Order status changed to ') + this.util.translate('ongoing'),
        icon: 'success',
        timer: 2000,
        backdrop: false,
        background: 'white'
      });
      this.navCtrl.back();
    }, error => {
      this.util.hide();
      console.log('error', error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
    });
  }

  delivered() {
    this.util.show();
    const userId = localStorage.getItem('uid');
    this.api.updateOrderStatus(this.id, 'delivered', userId).then((data) => {
      console.log(data);
      this.util.hide();
      const msg = this.myname + this.util.translate(' Delivered your order');
      const parm = {
        current: 'active',
      };
      this.api.updateProfile(userId, parm).then((data) => {
        console.log('driver status cahcnage----->', data);
      }).catch(error => {
        console.log(error);
      });
      this.api.sendNotification(msg, this.util.translate('Order delivered'), this.token).subscribe(data => {
        console.log(data);
      });
      this.navCtrl.back();
    }, error => {
      this.util.hide();
      console.log('error', error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

}
