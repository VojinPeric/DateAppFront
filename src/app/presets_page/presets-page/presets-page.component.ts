import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../nav-bar/nav-bar.component';
import { PresetElementComponent } from "../../preset-element/preset-element.component";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { CommonModule, NgFor, NgForOf } from '@angular/common';

@Component({
  selector: 'app-presets-page',
  imports: [NavBarComponent, PresetElementComponent, FormsModule, CommonModule, NgForOf, NgFor],
  templateUrl: './presets-page.component.html',
  styleUrl: './presets-page.component.css'
})
export class PresetsPageComponent {
  auth: AuthService = inject(AuthService);

  activePreset: string = "";

  newPreset: string = "";

  arrOfPresets: {id: number, name: string}[] = [];

  checked: string = "";

  private checkedOld: string = "";

  constructor() {
    let localActivePreset = this.auth.getActivePreset();
    if (localActivePreset) this.activePreset = localActivePreset.name;

    this.auth.getAllPresets().subscribe(response => {
      if (response) {
        this.arrOfPresets = response.arr;
        this.checkedOld = localActivePreset.idS.toString();
        this.checked = this.checkedOld;
      }
    })
  }

  onOptionChange(event: any) {
    this.checked = event.id;
    this.auth.selectActivePreset({presetId: Number(this.checked)}).subscribe(response => {
      if (!response) this.checked = this.checkedOld;
      else {
        this.checkedOld = event.id;
        this.auth.setActivePreset(response);
        this.activePreset = response.name;
      }
    });
  }

  makePreset() {
    this.auth.addPreset({name: this.newPreset}).subscribe(response => {
      if (response) {
        this.newPreset = "";
        this.arrOfPresets.push(response);
      }
    })
  }
}
