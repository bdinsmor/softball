import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import 'rxjs/Rx';

import { RosterModel } from './roster.model';
import { RosterService } from './roster.service';

@Component({
  selector: 'roster-page',
  templateUrl: 'roster.html'
})
export class RosterPage {
  roster: RosterModel = new RosterModel();
  loading: any;

  constructor(
    public nav: NavController,
    public rosterService: RosterService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    this.rosterService
      .getData()
      .then(data => {
        this.roster.players = data;
        this.loading.dismiss();
      });
  }

}
