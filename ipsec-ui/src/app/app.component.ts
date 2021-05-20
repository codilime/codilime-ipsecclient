import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

class Endpoint {
  remote_ip_sec: string = "";
  local_ip: string = "";
  peer_ip: string = "";
  psk: string = "";
  nat: boolean = false;
  bgp: boolean = false;
  hover: boolean = false;
};

class VRF {
  id: number | undefined = undefined;
  vlan: number = -1;
  active: boolean = false;
  client_name: string = "New VRF";
  crypto_ph1: string = "aes128-sha256-x25519";
  crypto_ph2: string = "aes128gcm128-x25519";
  physical_interface: string = "eth0";
  local_as: number = -1;
  lan_ip: string = "";
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
  crypto_ph1_list: string[] = ["aes128", "sha256", "x25519"];
  crypto_ph2_list: string[] = ["aes128gcm128", "x25519"];

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
        this.vrfs = data as VRF[];
      });
  }

  saveCryptos() {
    if (this.currentVRF === null)
      return;
    this.currentVRF.crypto_ph1 = this.crypto_ph1_list.join("-");
    this.currentVRF.crypto_ph2 = this.crypto_ph2_list.join("-");
    this.currentVRF.crypto_ph2 = this.currentVRF.crypto_ph2.replace("--", "-");
  }

  loadCryptos() {
    if (this.currentVRF === null)
      return;
    this.crypto_ph1_list = this.currentVRF.crypto_ph1.split("-");
    this.crypto_ph2_list = this.currentVRF.crypto_ph2.split("-");
    if (this.crypto_ph2_list.length < 3) {
      this.crypto_ph2_list.push(this.crypto_ph2_list[1]);
      this.crypto_ph2_list[1] = "";
    }
  }

  public setCurrentVRF(i: number) {
    this.currentVRF = this.vrfs[i];
    this.loadCryptos();
    this.addingNewEndpoint = false;
  }

  public addVRF() {
    this.addingNewEndpoint = false;
    this.httpClient.post("/api/vrfs", new VRF())
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.vrfs.push(data as VRF);
      })
  }

  public deleteVRF(event: MouseEvent, i: number) {
    event.stopPropagation();
    this.addingNewEndpoint = false;
    this.httpClient.delete("/api/vrfs/" + this.vrfs[i].id)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        let deletedVRF = this.vrfs.splice(i, 1);
        if (this.currentVRF?.id === deletedVRF[0].id) {
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
    if (this.currentVRF?.endpoints === null) {
      this.currentVRF.endpoints = [];
    }
    this.currentVRF?.endpoints.push(this.newEndpoint);
  }

  public saveAndApply() {
    this.saveCryptos();
    this.httpClient.put("/api/vrfs/" + this.currentVRF?.id, this.currentVRF)
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
