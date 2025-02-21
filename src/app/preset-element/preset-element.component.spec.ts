import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetElementComponent } from './preset-element.component';

describe('PresetElementComponent', () => {
  let component: PresetElementComponent;
  let fixture: ComponentFixture<PresetElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresetElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
