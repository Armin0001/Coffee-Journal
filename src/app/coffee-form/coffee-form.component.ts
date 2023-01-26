import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CoffeeService } from '../coffee.service';
import { ApiResponse } from '../models/apiResponse';
import {Record } from '../models/record';

@Component({
  selector: 'app-coffee-form',
  templateUrl: './coffee-form.component.html',
  styleUrls: ['./coffee-form.component.css']
})
export class CoffeeFormComponent implements OnInit, OnDestroy {
  populateFormSubscription: Subscription;
  coffeeServiceSubscription: Subscription;
  public addRecordForm: FormGroup;
  submitButton =  "";
  displayPopup = "none";
  resultPopupMessage = "";
  operation = "";
  hasApiResponsed = false;

  response: ApiResponse = {
    success: false
  }

  public record: Record; 


  constructor(private fb: FormBuilder, private coffeeService: CoffeeService) { 
    this.populateFormSubscription = this.coffeeService.sendPopulateForm().subscribe((data) => {
      this.populateForm(data);
      })
      }
  populateForm(id: number) {
    this.coffeeService.getRecord(id).subscribe((record:any) => {
      this.record = record as Record 
      this.addRecordForm = this.fb.group({
        id: this.record.id,
        type: this.record.type,
        bean: this.record.bean,
        location: this.record.location,
        dateCreated: this.record.dateCreated,
        score: this.record.score,
        noOfShots: this.record.noOfShots,
        price: this.record.price
      });
    })
  }

      
  

  ngOnInit(): void {
    this.emptyForm();
  }
  

  emptyForm() {
    this.submitButton = "Add Record"
    this.addRecordForm = this.fb.group({
    id: [0],
    type: ['', [Validators.required]],
    bean: [''],
    location: ['', [Validators.required]],
    dateCreated: ['', [Validators.required]],
    score: [''],
    noOfShots: ['', [Validators.required, Validators.min(0)]],
    price: ['']
    });
    }
    
    get registerFormControl(): { [key: string]: AbstractControl } {
      return this.addRecordForm.controls;
    }

    onSubmit() {
      if (this.addRecordForm.value.id > 0) {
      this.coffeeServiceSubscription=this.coffeeService.updateRecord(this.addRecordForm.value).subscribe((data) => {
      this.coffeeService.updateList();
      this.response = data as ApiResponse; 
      this.operation = "updated";
      this.openPopup(this.response.success);
      this.hasApiResponsed = true;
      this.emptyForm();
    });
    } else {
          this.coffeeService.addRecord(this.addRecordForm.value).subscribe((data) => {
          this.coffeeService.updateList();
          this.response = data as ApiResponse; 
          this.operation = "added";
          this.openPopup(this.response.success);
          console.log(data);
          this.emptyForm();
          this.hasApiResponsed = true;
        })
        if (!this.hasApiResponsed) {
          this.openPopup(false);
        }
    }
  }


openPopup(result: boolean) {
	this.displayPopup = "block";
	
	if (result != null && result) {
	this.resultPopupMessage = `Record ${this.operation} successfully`;
	} else {
	this.resultPopupMessage = "There was an error";
	}
	}

  closePopup() {
    this.displayPopup = "none";
  }

  ngOnDestroy() {
    this.populateFormSubscription.unsubscribe();
    this.coffeeServiceSubscription.unsubscribe();
  }


}