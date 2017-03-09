import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from "@angular/http";

import { AboutPage } from '../pages/about/about';
import { AccountConfirmationCodePage } from '../pages/account-confirmation-code/account-confirmation-code';
import { AccountChangePasswordPage } from '../pages/account-change-password/account-change-password';
import { AccountForgotPasswordPage } from '../pages/account-forgot-password/account-forgot-password';
import { AccountPage } from '../pages/account/account';
import { AccountSigninPage } from '../pages/account-signin/account-signin';
import { AccountSigninUsingSAMLPage } from '../pages/account-signin-using-saml/account-signin-using-saml';
import { AccountSignupPage } from '../pages/account-signup/account-signup';
import { LineupsPage } from '../pages/lineups/lineups';
import { LineupPage } from '../pages/lineup/lineup';
import { RosterPage } from '../pages/roster/roster';
import { FollowersPage } from '../pages/followers/followers';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';
import { WelcomePage } from '../pages/welcome/welcome';


import { PreloadImage } from '../components/preload-image/preload-image';
import { BackgroundImage } from '../components/background-image/background-image';
import { ShowHideContainer } from '../components/show-hide-password/show-hide-container';
import { ShowHideInput } from '../components/show-hide-password/show-hide-input';
import { ColorRadio } from '../components/color-radio/color-radio';
import { CounterInput } from '../components/counter-input/counter-input';
import { Rating } from '../components/rating/rating';

import { RosterService } from '../pages/roster/roster.service';
import { ProfileService } from '../pages/profile/profile.service';
import { ScheduleService } from '../pages/lineups/schedule.service';
import { LineupService } from '../pages/lineup/lineup.service';

import { BrowserModule } from "@angular/platform-browser";
import { HttpService } from "../services/http-service";
import {
  IamAuthorizerClient,
  CustomAuthorizerClient,
  UserPoolsAuthorizerClient,
  NoAuthorizationClient
} from "../services/recipes-api.service";

@NgModule({
  declarations: [
    AccountConfirmationCodePage,
    AccountChangePasswordPage,
    AccountForgotPasswordPage,
    AccountPage,
    AccountSigninPage,
    AccountSigninUsingSAMLPage,
    AccountSignupPage,
    LineupsPage,
    LineupPage,
    RosterPage,
    FollowersPage,
    ProfilePage,
    SettingsPage,
    MyApp,
    TabsPage,
    WelcomePage,
    PreloadImage,
    BackgroundImage,
    ShowHideContainer,
    ShowHideInput,
    ColorRadio,
    CounterInput,
    Rating
  ],
  imports: [
    HttpModule,
    IonicModule.forRoot(MyApp),
    BrowserModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AccountConfirmationCodePage,
    AccountChangePasswordPage,
    AccountForgotPasswordPage,
    AccountPage,
    AccountSigninPage,
    AccountSigninUsingSAMLPage,
    AccountSignupPage,
    LineupsPage,
    LineupPage,
    RosterPage,
    FollowersPage,
    ProfilePage,
    SettingsPage,
    MyApp,
    TabsPage,
    WelcomePage,
  ],
  providers: [RosterService, ProfileService, ScheduleService, LineupService,
    { provide: HttpService, useClass: HttpService },
    { provide: CustomAuthorizerClient, useClass: CustomAuthorizerClient },
    { provide: IamAuthorizerClient, useClass: IamAuthorizerClient },
    { provide: UserPoolsAuthorizerClient, useClass: UserPoolsAuthorizerClient },
    { provide: NoAuthorizationClient, useClass: NoAuthorizationClient },
  ]
})
export class AppModule { }
