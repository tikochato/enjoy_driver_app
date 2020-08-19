import { Component } from '@angular/core';

import { Platform, ActionSheetController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { UtilService } from './services/util.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private geolocation: Geolocation,
    private api: ApiService,
    private translate: TranslateService,
    private oneSignal: OneSignal,
    private nativeAudio: NativeAudio,
    private actionSheetController: ActionSheetController,
    private util: UtilService
  ) {

    const lng = localStorage.getItem('language');
    if (!lng || lng === null) {
      localStorage.setItem('language', 'spanish');
    }
    this.translate.use(localStorage.getItem('language'));
    this.initializeApp();
  }
  updateLocation(lat, lng) {
    if (localStorage.getItem('uid')) {
      const param = {
        lat: lat,
        lng: lng
      }
      this.api.updateProfile(localStorage.getItem('uid'), param).then((data) => {
        // console.log(data);
      }).catch(error => {
        console.log(error);
      });
    }
  }
  getLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      localStorage.setItem('lat', resp.coords.latitude.toString());
      localStorage.setItem('lng', resp.coords.longitude.toString());
      this.updateLocation(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      localStorage.setItem('lat', data.coords.latitude.toString());
      localStorage.setItem('lng', data.coords.longitude.toString());
      this.updateLocation(data.coords.latitude, data.coords.longitude);
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('New Notification'),
      mode: 'md',
      buttons: [{
        text: this.util.translate('OK'),
        icon: 'volume-mute',
        handler: () => {
          this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
        }
      }]
    });

    await actionSheet.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      setTimeout(async () => {
        await this.oneSignal.startInit(environment.onesignal.appId, environment.onesignal.googleProjectNumber);
        this.oneSignal.getIds().then((data) => {
          localStorage.setItem('fcm', data.userId);
        });
        this.oneSignal.clearOneSignalNotifications();
        this.oneSignal.enableSound(true);
        await this.oneSignal.endInit();
      }, 1000);
      this.nativeAudio.preloadSimple('audio', 'assets/alert.mp3').then((data: any) => {
        this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
      }, error => {
        console.log(error);
      }).catch(error => {
        console.log(error);
      });
      this.oneSignal.handleNotificationReceived().subscribe(data => {
        this.nativeAudio.play('audio', () => console.log('audio is done playing')).catch(error => console.log(error));
        this.nativeAudio.setVolumeForComplexAsset('audio', 1);
        this.presentActionSheet();
      });
      this.oneSignal.handleNotificationOpened().subscribe(data => {
        this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
      });
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
      this.getLocation();
    });
  }
}
