import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialIssueEntry } from './material-issue-entry';

describe('MaterialIssueEntry', () => {
  let component: MaterialIssueEntry;
  let fixture: ComponentFixture<MaterialIssueEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialIssueEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialIssueEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
