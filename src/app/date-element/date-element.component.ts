import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-date-element',
  imports: [FormsModule],
  templateUrl: './date-element.component.html',
  styleUrl: './date-element.component.css'
})
export class DateElementComponent {
  auth: AuthService = inject(AuthService);

  @Input()
  idDate: number = 0;

  get idDateStr (): string {
    return this.idDate.toString();
  }

  get idDateStrY (): string {
    return this.idDateStr + "Y";
  }

  get idDateStrN (): string {
    return this.idDateStr + "N";
  }

  @Input()
  text: string = "";

  checked?: string = "No";

  @Input()
  set isChecked(tmp: boolean) {
    if (tmp) this.checked = "Yes";
  }

  onOptionChange(event: any) {
    this.checked = event.target.value;
    let toExecute;
    if (this.checked == "Yes") toExecute = this.auth.addDateToPool({dateId: Number(this.idDate)});
    else toExecute = this.auth.deleteDateFromPool({dateId: Number(this.idDate)});
    toExecute.subscribe(success => {
      if (!success) {
        if (event.target.value == "Yes") this.checked = "No";
        else this.checked = "Yes";
      }
    })
  }

}
