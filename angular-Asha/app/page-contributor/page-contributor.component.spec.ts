import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageContributorComponent } from './page-contributor.component';

describe('PageContributorComponent', () => {
  let component: PageContributorComponent;
  let fixture: ComponentFixture<PageContributorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageContributorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageContributorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
