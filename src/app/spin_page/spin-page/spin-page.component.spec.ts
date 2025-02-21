import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinPageComponent } from './spin-page.component';

describe('SpinPageComponent', () => {
  let component: SpinPageComponent;
  let fixture: ComponentFixture<SpinPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
