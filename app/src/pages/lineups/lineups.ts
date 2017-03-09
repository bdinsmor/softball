import { Component } from '@angular/core';
import { NavController, SegmentButton, LoadingController } from 'ionic-angular';
import 'rxjs/Rx';

import { ScheduleModel } from './schedule.model';
import { ScheduleService } from './schedule.service';
import { LineupPage } from '../lineup/lineup';
@Component({
  selector: 'lineups-page',
  templateUrl: 'lineups.html'
})
export class LineupsPage {
  schedule: ScheduleModel = new ScheduleModel();
  loading: any;
  lineupPage:any = LineupPage;

  constructor(
    public nav: NavController,
    public scheduleService: ScheduleService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    this.scheduleService
      .getData()
      .then(data => {
        this.schedule.today = data.today;
        this.schedule.upcoming = data.upcoming;
        this.loading.dismiss();
      });
  }

  openLineup(item) {
      this.nav.setRoot(this.lineupPage);
  }


}
