import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagResults } from './tag-results';

describe('TagResults', () => {
  let component: TagResults;
  let fixture: ComponentFixture<TagResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
