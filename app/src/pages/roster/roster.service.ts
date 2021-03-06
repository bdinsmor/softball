import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { PlayerModel, RosterModel } from './roster.model';

@Injectable()
export class RosterService {
  constructor(public http: Http) {}

  getData(): Promise<PlayerModel[]> {
    return this.http.get('http://52.90.86.84:8080/players?year=2017&season=Spring')
     .toPromise()
     .then(response => response.json() as PlayerModel[])
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
