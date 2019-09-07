import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSubmissionComponent } from './page-submission.component';

describe('PageSubmissionComponent', () => {
  let component: PageSubmissionComponent;
  let fixture: ComponentFixture<PageSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
