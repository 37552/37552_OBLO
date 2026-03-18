import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) { }

  loadConfig(): Promise<void> {
    return firstValueFrom(this.http.get('/assets/config.json'))
      .then(data => {
        this.config = data;
      })
      .catch(() => {
        console.error('Could not load configuration file');
      });
  }


  get apiUrl(): string {
    return this.config ? this.config.apiUrl : '';
  }
  get elockerUrl(): string {
    return this.config ? this.config.elockerUrl : '';
  }
  get appTitle(): string {
    return this.config ? this.config.appTitle : 'WebApp';
  }
get baseUrl(): string {
    return this.config ? this.config.baseUrl : '';
  }
}
