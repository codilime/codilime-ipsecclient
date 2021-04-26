import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

class Endpoint {
  remoteIPSec: string = "";
  localIP: string = "";
  peerIP: string = "";
  PSK: string = "";
  hover: boolean = false;
};

class VRF {
  VLAN: number = -1;
  Active: boolean = false;
  customName: string = "New VRF";
  cryptoPh1: string = "aes128-sha256-x25519";
  cryptoPh2: string = "aes128gcm128-x25519";
  physicalInterface: string = "eth0";
  endpoints: Endpoint[] = [];
  hover: boolean = false;
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

  ngOnInit() {
    this.httpClient.get("/api/vrfs")
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.vrfs = JSON.parse(data as string) as VRF[];
      });
  }

  public setCurrentVRF(i: number) {
    this.currentVRF = this.vrfs[i];
    this.addingNewEndpoint = false;
  }

  public addVRF() {
    this.addingNewEndpoint = false;
    this.httpClient.post("/api/vrfs", {})
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.vrfs.push(new VRF());
      })
  }

  public deleteVRF(event: MouseEvent, i: number) {
    event.stopPropagation();
    this.addingNewEndpoint = false;
    this.httpClient.delete("/api/vrfs/" + this.vrfs[i].VLAN)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        let deletedVRF = this.vrfs.splice(i, 1);
        if (this.currentVRF?.VLAN === deletedVRF[0].VLAN) {
          this.currentVRF = null;
        }
      })
  }

  public startAddingEndpoint() {
    this.newEndpoint = new Endpoint();
    this.addingNewEndpoint = true;
  }

  public finishAddingEndpoint() {
    this.addingNewEndpoint = false;
    this.currentVRF?.endpoints.push(this.newEndpoint);
  }

  public saveAndApply() {
    // console.log(JSON.stringify(this.vrfs));
    this.httpClient.put("/api/vrfs/" + this.currentVRF?.VLAN, this.currentVRF)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        console.log("put:", data);
        alert("save & apply succeeded");
      });
  }

  public deleteEndpoint(i: number) {
    this.currentVRF?.endpoints.splice(i, 1);
  }
}
