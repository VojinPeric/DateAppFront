import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolPageComponent } from './pool-page.component';

describe('PoolPageComponent', () => {
  let component: PoolPageComponent;
  let fixture: ComponentFixture<PoolPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoolPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoolPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
