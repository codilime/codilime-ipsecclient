import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ipsec-ui';

  httpClient: HttpClient;

  constructor(private http: HttpClient) {
    this.httpClient = http;
  }

  public onClick() {
    this.httpClient.get("/api/test")
      .subscribe((data: any) => {
        console.log(data);
      });
  }
}
