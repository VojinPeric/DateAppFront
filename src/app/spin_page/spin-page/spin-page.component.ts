import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../nav-bar/nav-bar.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from '../../service/auth.service';
import { response } from 'express';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-spin-page',
  imports: [NavBarComponent, FormsModule],
  templateUrl: './spin-page.component.html',
  styleUrl: './spin-page.component.css',
})
export class SpinPageComponent {
  auth: AuthService = inject(AuthService);

  srcForPng: string = "/animationCardPng/state0.png";

  activeDate: string = "";

  arrDate: {idDate: number, name: string}[] = [];

  shouldDelete: boolean = true;

  private tmpName: string = "";

  constructor() {
    this.auth.getActiveDate().subscribe(response => {
      if (response) {
        this.activeDate = response.name;
      }
    })

    this.auth.getCheckedDates().subscribe(response => {
      if (response) {
        this.arrDate = response.arr;
      }
    })
  }

  findRandomActiveDate() {
    let shouldD = this.shouldDelete;
    let i = Math.floor(Math.random() * this.arrDate.length);
    let execute;
    if (this.shouldDelete) {
      execute = this.auth.setActiveDateAndDeleteFromPool(this.arrDate[i]);
    }
    else {
      execute = this.auth.setActiveDate(this.arrDate[i]);
    }
    execute.subscribe(success => {
      if (success) {
        this.tmpName = this.arrDate[i].name;
        if (shouldD) this.arrDate.splice(i, 1);
        this.cascade();
      }
    })
  }

  displayDate() {
    this.activeDate = this.tmpName;
  }

  private countSpin = 0;
  private countNumber = 0;

  spin() {
    if (this.arrDate.length == 0) {
      alert("No dates to choose from, please go select dates");
      return;
    }
    this.findRandomActiveDate();
  }

  cascade() {
    this.countNumber++;
    if (this.countNumber > 11) {
      this.countNumber = 0;
      this.countSpin++;
      if (this.countSpin > 5) {
        this.countSpin = 0;
        let i = Math.floor(Math.random() * 7);
        this.srcForPng = "/animationCardPng/finalState" + i + ".png";
        this.displayDate();
        return;
      }
    }
    console.log(this.countSpin + " " + this.countNumber)
    this.srcForPng = "/animationCardPng/state" + this.countNumber + ".png";
    setTimeout(() => {this.cascade();}, 100);
  }

}
