import { Component, inject } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { AuthService } from '../../service/auth.service';
import { DateElementComponent } from "../../date-element/date-element.component";
import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pool-page',
  imports: [NavBarComponent, DateElementComponent, CommonModule, NgFor, NgForOf, FormsModule],
  templateUrl: './pool-page.component.html',
  styleUrl: './pool-page.component.css'
})
export class PoolPageComponent {
  auth: AuthService = inject(AuthService);
  arrOfDates: {name: string, id: number, isChecked:boolean}[] = [];
  makeField: string = "";

  constructor() {
    this.auth.getAllDates().subscribe(response => {
      if (response) {
        this.arrOfDates = response.arr;
      }
    })
  }
  
  addDateLocal() {
    this.auth.addDateLocal({name: this.makeField}).subscribe(response => {
      if (response) {
        this.arrOfDates.push(response);
        this.makeField = "";
      }
    })
  }
}
