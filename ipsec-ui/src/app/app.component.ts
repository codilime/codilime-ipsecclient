import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

class Endpoint {
  remoteIPSec: string = "";
  localIP: string = "";
  peerIP: string = "";
  PSK: string = "";
};

class VRF {
  VLAN: number = -1;
  customName: string = "New VRF";
  cryptoPh1: string = "aes128-sha256-x25519";
  cryptoPh2: string = "aes128gcm128-x25519";
  physicalInterface: string = "eth0";
  endpoints: Endpoint[] = [];
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ipsec-ui';

  httpClient: HttpClient;

  vrfs: VRF[] = [];
  currentVRF: VRF | null = null;
  addingNewEndpoint = false;

  newEndpoint: Endpoint = new Endpoint();

  constructor(private http: HttpClient) {
    this.httpClient = http;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was:`, error.error);
    }
    alert("an error occurred");
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

  public setCurrentVRF(i: number) {
    this.currentVRF = this.vrfs[i];
    this.addingNewEndpoint = false;
  }

  public addVRF() {
    this.vrfs.push(new VRF());
    this.addingNewEndpoint = false;
  }

  public deleteVRF(i: number) {
    this.vrfs.splice(i, 1);
    this.addingNewEndpoint = false;
  }

  public startAddingEndpoint() {
    this.newEndpoint = new Endpoint();
    this.addingNewEndpoint = true;
  }

  public finishAddingEndpoint() {
    this.addingNewEndpoint = false;
    this.currentVRF?.endpoints.push(this.newEndpoint);
  }
}
