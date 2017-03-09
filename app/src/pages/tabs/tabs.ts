import { Component }         from '@angular/core'; 
import { NavController, NavParams, Tab, Tabs } from 'ionic-angular';
import { RosterPage } from '../roster/roster'; 
import { LineupsPage } from '../lineups/lineups'; 
import { AccountPage }       from '../account/account';

@Component({ 
  templateUrl: 'tabs.html' 
}) 


export class TabsPage { 
  // this tells the tabs component which Pages 
  // should be each tab's root Page 
  tab1Root: any = RosterPage;
  tab2Root: any = LineupsPage;
  tab3Root: any = AccountPage;
  mySelectedIndex: number;

  constructor(navParams: NavParams, public navCtrl : NavController) { 
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }


  showRoot(tabs : Tabs, index : number) {
    // if a child page is associated with that Tab, then pop it off the NavController stack
    let tab : Tab = tabs.getByIndex(index);
    let views = tab['_views'];
    if (views.length > 1) {
      let navController = views[views.length - 1].instance.navCtrl
      if (navController) {
        navController.popToRoot({animate: false});
      }
    }
	} 
}