import { Component, ViewChild } from '@angular/core';
import { NavController, SegmentButton, LoadingController, Slides } from 'ionic-angular';
import { LineupModel } from './lineup.model';
import { LineupService } from './lineup.service';
import 'rxjs/Rx';


@Component({
  selector: 'lineup-page',
  templateUrl: 'lineup.html'
})
export class LineupPage {
  loading: any;
  inning: string;
  mode:string = "fielding";
  lineup: LineupModel = new LineupModel();
  currentInning:number = 1;

  lineupPage:any = LineupPage;
  @ViewChild(Slides) slides: Slides;

  constructor(
    public nav: NavController,
    public lineupService: LineupService,
    public loadingCtrl: LoadingController
  ) {
    this.inning = "1";
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    this.lineupService
      .getData()
      .then(data => {
        this.lineup.battingOrder = data.battingOrder;
        this.lineup.fielding = data.fielding;
       // console.log(JSON.stringify(data.fielding,null,2));
        this.currentInning = 1;
        this.loading.dismiss();
      });
  }

  slideChanged() {
    console.log("inside slideChanged...");
    let currentIndex = this.slides.getActiveIndex();
    this.currentInning = currentIndex + 1;
    console.log("Current index is", currentIndex);
  }

  


}
