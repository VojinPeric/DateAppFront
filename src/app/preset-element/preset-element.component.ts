import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preset-element',
  imports: [FormsModule],
  templateUrl: './preset-element.component.html',
  styleUrl: './preset-element.component.css'
})
export class PresetElementComponent {
  @Input()
  idPreset: number = 0;

  get idPresetStr(): string {
    return this.idPreset.toString();
  }

  @Input()
  name: string = "";

  @Input()
  checked: string = "";

  @Output()
  emitChange: EventEmitter<any> = new EventEmitter<any>();

  onOptionChangePreset(event: any) {
    this.emitChange.emit({id: event.target.id});
  }
}
