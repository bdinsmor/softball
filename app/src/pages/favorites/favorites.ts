import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GlobalStateService } from '../../services/global-state.service';
import { AccountSigninPage } from '../account-signin/account-signin';
import { UserLoginService } from "../../services/account-management.service";
import { Booking } from "../../services/recipes-sdk/model/Booking";
import { AccountSignupPage } from '../account-signup/account-signup';
import { IamAuthorizerClient } from "../../services/recipes-api.service";

import { CustomAuthorizerClient } from "../../services/recipes-api.service";
import { Logger } from '../../services/logger.service';
import { CognitoUtil, UserState } from '../../services/account-management.service';
import { Recipe } from "../../services/recipes-sdk/model/Recipe";

@Component({
  templateUrl: 'favorites.html',
})
export class FavoritesPage {
  initialized = false;
  accountSigninPage = AccountSigninPage;
  accountSignupPage = AccountSignupPage;
  favorites: Recipe[] = [];
  data: any = [];




  loadFavorites(userId): void {
   
  };

  constructor(public navCtrl: NavController,  public globals: GlobalStateService, private authClient: IamAuthorizerClient) {
    // empty
  }

  ionViewDidEnter() {
    Logger.banner("My Favorites");
    this.data = [];
    if (!this.initialized) {

      if (this.globals.userId != '' && CognitoUtil.getUserState() == UserState.SignedIn && UserLoginService.getAwsAccessKey() != null) {
        this.initialized = false;
        UserLoginService.getAwsCredentials()
        .then(() => {
          this.globals.displayLoader("Loading...");
          this.loadFavorites(this.globals.getUserId());
        })
        .catch((err) => {
          this.globals.displayAlert('Error encountered', 'Unable to load favorites. Please check the console logs for more information.');
          console.log("ERROR: Unable to load FavoritesPage!");
          console.log(err)
        })
      } else {
        this.initialized = true;
      }
    }
  }

  ionViewDidLeave() {
    this.initialized = false;
    this.data = [];
  }
}
