import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [ButtonModule],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss',
  encapsulation: ViewEncapsulation.None
})
export class PageNotFound {

  constructor(private router: Router) { }

  gotoHome() {
    this.router.navigate(['/home']);
  }
}
