import { Component, NgZone, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfigService } from './shared/config.service';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ConfirmDialogModule,
    ToastModule,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  styles: [`
    @import 'https://cdn.tailwindcss.com';
    @import 'https://unpkg.com/primeicons@6.0.1/primeicons.css';
  `],

})
export class App {
  protected readonly title = signal('oblo');
  isNative: boolean = false
  constructor(public router: Router, private titleService: Title, private configService: ConfigService,  private ngZone: NgZone) {
    this.isNative = Capacitor.isNativePlatform();
    // if (this.isNative) {
    //   this.handleBackButton();
    // }
  }
  ngOnInit() {
    this.titleService.setTitle(this.configService.appTitle);
    if (this.isNative) {
      // this.pushService.initPush();
    }
  }
}
