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
  remote_as: number = -1;
  hover: boolean = false;
  source_interface: string = "";
};

class VRF {
  id: number | undefined = undefined;
  vlan: number = -1;
  active: boolean = false;
  hardware_support: boolean = false;
  client_name: string = "New VRF";
  crypto_ph1: string[] = ["aes-cbc-128", "sha256", "modp_2048"];
  crypto_ph2: string[] = ["esp-gcm", "fourteen"];
  physical_interface: string = "eth0";
  local_as: number = -1;
  lan_ip: string = "";
  endpoints: Endpoint[] = [];

  hover: boolean = false;
};

class Metrics {
  bird: Map<string, string> = new Map<string, string>();
  strongswan: Map<string, string> = new Map<string, string>();
  supervisor: Map<string, string> = new Map<string, string>();
  routes: Map<string, string[]> = new Map<string, string[]>();
};

class Algorithms {
  encryption: string[] = [];
  integrity: string[] = [];
  key_exchange: string[] = [];
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
  metrics: Metrics = new Metrics();
  currentVRF: VRF | null = null;
  addingNewEndpoint = false;
  software: Algorithms = new Algorithms();
  hardwarePh1: Algorithms = new Algorithms();
  hardwarePh2: Algorithms = new Algorithms();
  crypto_ph1_list: string[] = ["aes-cbc-128", "sha256", "fourteen"];
  crypto_ph2_list: string[] = ["esp-gcm", "group14"];

  newEndpoint: Endpoint = new Endpoint();
  oldMetrics: string = "";

  showLoading: boolean = false;

  constructor(private http: HttpClient) {
    this.httpClient = http;
  }

  private handleError(error: HttpErrorResponse) {
    this.showLoading = false;
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

  private getMetric() {
    if (this.currentVRF == null) {
      this.httpClient.get("/api/metrics")
        .pipe(
          catchError(this.handleError)
        )
        .subscribe((data) => {
          if (JSON.stringify(data) === this.oldMetrics)
            return;
          this.oldMetrics = JSON.stringify(data);
          this.metrics = data as Metrics;
        });
      return;
    }
    if (!this.currentVRF.active) {
      return;
    }
    this.httpClient.get("/api/metrics/" + this.currentVRF.vlan + "-" + this.currentVRF.client_name)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
          if (JSON.stringify(data) === this.oldMetrics)
            return;
          this.oldMetrics = JSON.stringify(data);
          this.metrics = data as Metrics;
        });
  }

  ngOnInit() {
    this.httpClient.get("/api/vrfs")
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.vrfs = data as VRF[];
      });
    this.httpClient.get("/api/algorithms/software")
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.software = data as Algorithms;
      });
      this.httpClient.get("/api/algorithms/hardware/ph1")
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.hardwarePh1 = data as Algorithms;
      });
      this.httpClient.get("/api/algorithms/hardware/ph2")
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.hardwarePh2 = data as Algorithms;
      });
    this.getMetric();
    setInterval(()=> { this.getMetric() }, 3000);
  }

  saveCryptos() {
    if (this.currentVRF === null)
      return;
    this.currentVRF.crypto_ph1 = this.crypto_ph1_list.slice();
    this.currentVRF.crypto_ph2 = this.crypto_ph2_list.slice();
  }

  loadCryptos() {
    if (this.currentVRF === null)
      return;
    this.crypto_ph1_list = this.currentVRF.crypto_ph1.slice();
    this.crypto_ph2_list = this.currentVRF.crypto_ph2.slice();
    if (this.crypto_ph2_list.length < 3) {
      this.crypto_ph2_list.push(this.crypto_ph2_list[1]);
      this.crypto_ph2_list[1] = "";
    }
  }

  public setCurrentVRF(i: number) {
    this.currentVRF = this.vrfs[i];
    this.loadCryptos();
    this.addingNewEndpoint = false;
    this.getMetric();
  }

  public unsetCurrentVRF() {
    this.currentVRF = null;
    this.addingNewEndpoint = false;
    this.getMetric();
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
    this.showLoading = true;
    this.httpClient.delete("/api/vrfs/" + this.vrfs[i].id)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        this.showLoading = false;
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
    this.showLoading = true;
    this.httpClient.put("/api/vrfs/" + this.currentVRF?.id, this.currentVRF)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data) => {
        console.log("put:", data);
        this.showLoading = false;
        alert("save & apply succeeded");
      });
  }

  public deleteEndpoint(i: number) {
    this.currentVRF?.endpoints.splice(i, 1);
  }
}
