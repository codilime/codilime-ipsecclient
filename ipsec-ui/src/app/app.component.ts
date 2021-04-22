import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

let lastID: number = 0;

class Tunnel {
  ID: number;
  ClientName: string = "";
  TunnelNumber: number = 0;
  RemoteIPSec: string = "";
  CryptoPH1: string = "aes128-sha256-x25519";
  PSK: string = "";

  constructor() {
    this.ID = lastID++;
  }
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ipsec-ui';

  httpClient: HttpClient;

  tunnels: Tunnel[] = [];

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
        `body was: ${error.error}`);
    }
    alert("an error occurred");
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

  public onClick() {
    this.httpClient.post("/api/updateconfig", this.tunnels)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        console.log(data);
        alert("ok");
      });
  }

  public addTunnel() {
    this.tunnels.push(new Tunnel());
  }

  public deleteTunnel(i: number) {
    this.tunnels.splice(i, 1);
  }
}
