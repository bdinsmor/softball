import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';
import {RosterPage} from '../roster/roster';
import { ProfileModel } from '../profile/profile.model';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'settings-page',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  settingsForm: FormGroup;
  // make WalkthroughPage the root (or first) page
  rootPage: any = RosterPage;
  loading: any;
  profile: ProfileModel = new ProfileModel();

  constructor(
    public nav: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public profileService: ProfileService
  ) {
    this.loading = this.loadingCtrl.create();

    this.settingsForm = new FormGroup({
      name: new FormControl(),
      location: new FormControl(),
      description: new FormControl(),
      currency: new FormControl(),
      weather: new FormControl(),
      notifications: new FormControl()
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    this.profileService
      .getData()
      .then(data => {
        this.profile.user = data.user;

        this.settingsForm.setValue({
          name: data.user.name,
          location: data.user.location,
          description: data.user.about,
          currency: 'dollar',
          weather: 'fahrenheit',
          notifications: true
        });

        this.loading.dismiss();
      });
  }

  logout() {
    // navigate to the new page if it is not the current page
    this.nav.setRoot(this.rootPage);
  }

}
