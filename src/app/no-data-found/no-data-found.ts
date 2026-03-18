import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-data-found',
  imports: [],
  templateUrl: './no-data-found.html',
  styleUrl: './no-data-found.scss'
})
export class NoDataFound {

  @Input() message: string = 'No Data Found';

}
