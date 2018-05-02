import { Component, OnInit, Input } from '@angular/core';
import { Supplier } from '../../domain/models/supplier';
import { ActivatedRoute, Router } from '@angular/router';
import { JobsHttpService, SupplyListService, UserpageHttpService } from '../../domain';
import { Account, Supply, Job } from '../../domain';

import { DataService } from "../data.service";
// import { pencil } from 'octicons';



@Component({
  selector: 'app-addjobs',
  templateUrl: './addjobs.component.html',
  styleUrls: ['./addjobs.component.css']
})
export class AddjobsComponent implements OnInit {
  public title: string;
  public supplies: Supply[];
  public account: Account;
  public tempSupply: any;

  public supSupply: any;
  public x : any[];
  public showSuppliers: boolean;
  @Input()
  public tempJob: Job;
  @Input()
  public indexJob: number;
  @Input()
  public fromView: boolean;

  constructor(
    private jobsHttpService: JobsHttpService,
    private supplylistService: SupplyListService,
    public userpageRepository: UserpageHttpService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.supplies = [];
    this.supplylistService.get().subscribe(resp => {
      if (resp.status == 200) {
        for (let result of resp.body.results)
        {
          this.supplies.push({id: result.Supply_ID, name: result.Name});
        }
      }
      else {
        this.supplies =[];
      }
    });
    if (!this.fromView) {
      this.activatedRoute.params.subscribe((params: any) => {
        this.userpageRepository.getById(+params.userId).subscribe(resp => {
          if (resp.status == 200) {
            for (let i = 0; i < resp.body.jobs.length; ++i) {
              if (resp.body.jobs[i].start_date)
                resp.body.jobs[i].startDate = new Date(resp.body.jobs[i].start_date.replace(/-/g, '\/').replace(/T.+/, '') );
  
              if (resp.body.jobs[i].end_date)
                resp.body.jobs[i].endDate = new Date(resp.body.jobs[i].end_date.replace(/-/g, '\/').replace(/T.+/, '') );
            }
            
  
            for (let i = 0; i < resp.body.tasks.length; ++i) {
              resp.body.tasks[i].title = resp.body.tasks[i].Name;
              resp.body.tasks[i].description = resp.body.tasks[i].Description;
  
              if (resp.body.tasks[i].Creation_Date){
                resp.body.tasks[i].startDate = new Date(resp.body.tasks[i].Creation_Date.replace(/-/g, '\/').replace(/T.+/, '') );
              }
  
              if (resp.body.tasks[i].Estimated_Date){
                resp.body.tasks[i].endDate = new Date(resp.body.tasks[i].Estimated_Date.replace(/-/g, '\/').replace(/T.+/, '') );
              }
            }
            this.account = resp.body;
            this.account.id = params.userId;
            this.indexJob = this.account.jobs.length;
          }
        });
      });
      this.tempJob = {
        id: this.indexJob,
        title: '',
        address: '',
        city: '',
        state: '',
        cost: 0,
        startDate: new Date(),
        endDate: new Date(),
        status: "",
        supplies: []
      };
      this.fromView = false;
      this.title = 'Create A New Job';
      console.log("if not fromview")
    }
    console.log(this.tempJob);
  }

  addSupply() {
    this.tempJob.supplies.push({ id: this.supplies[this.tempSupply - 1].id, name: this.supplies[this.tempSupply - 1].name });

  }

  addJob() {
    this.tempJob.status = "In Progress";
    // this.account.jobs[this.indexJob]=this.tempJob;
    // this.indexJob=this.account.jobs.length;

    //send http request to add job
    this.activatedRoute.params.subscribe((params: any) => {
      this.jobsHttpService.addJob(+params.userId, this.tempJob).subscribe(resp => {
        if (resp.status == 200) {
          this.router.navigateByUrl(`/userpage/${+params.userId}`);
        }
      });
    });



    //Clear job formstatusString
    // this.tempJob={
    //   id:this.indexJob,
    //   title:'',
    //   location:"",
    //   cost:0,
    //   startDate: new Date(),
    //   endDate: new Date(),
    //   status: "",
    //   supplies:[]
    // };
    // this.title = 'Create A New Job';

    //route user to active jobs page
  }

  editJob(i) {
    if (i !== this.indexJob) {
      var r = confirm("Editing " + this.account.jobs[i].title + " will cause you to lose any unsaved changes to the current job. Are you sure you want to continue?");
      if (r === true) {
        this.title = 'Edit ' + this.account.jobs[i].title;
        this.tempJob.title = this.account.jobs[i].title;
        this.tempJob.cost = this.account.jobs[i].cost;
        this.tempJob.endDate = this.account.jobs[i].endDate;
        this.tempJob.id = this.account.jobs[i].id;
        this.tempJob.address = this.account.jobs[i].address;
        this.tempJob.city = this.account.jobs[i].city;
        this.tempJob.state = this.account.jobs[i].state;
        this.tempJob.status = this.account.jobs[i].status;
        this.tempJob.startDate = this.account.jobs[i].startDate;
        var j: number;
        this.tempJob.supplies = [];
        for (j = 0; j < this.account.jobs[i].supplies.length; j++) {
          this.tempJob.supplies[j] = this.account.jobs[i].supplies[j];
        }
        this.indexJob = i;
      }
    }
  }

  emptyJob() {
    var r = confirm("Creating new job will cause you to lose any unsaved changes to the current job. Are you sure you want to continue?");
    if (r === true) {
      this.indexJob = this.account.jobs.length;
      this.tempJob = {
        id: this.indexJob,
        title: '',
        address: "",
        city: " ",
        state: '',
        cost: 0,
        startDate: new Date(),
        endDate: new Date(),
        status: "",
        supplies: []
      };
      this.title = 'Create A New Job';
    }
  }

  removeSupply(index) {
    if (index > -1) {
      this.tempJob.supplies.splice(index, 1);
    }
  }
  suppliers(supply){
    this.supSupply=supply;
    this.showSuppliers=true;
  }
  removeSuppliers(supply){
    let j:number;
    for(j = 0; j < this.tempJob.supplies.length; j++) {
      if (this.tempJob.supplies[j] === supply) {
       this.tempJob.supplies[j].supplier = null;
      }
    }
  }
  hideSuppliers(){
    this.showSuppliers=false;
  }
  onAddSupplier(newSupplier: Supplier) {
    console.log("Received new supplier!");
    console.log(newSupplier);
    console.log(this.tempJob);
    this.showSuppliers=false;
    let j: number;
    for (j = 0; j < this.tempJob.supplies.length; j++) {
      if (this.tempJob.supplies[j] === this.supSupply) {
       this.tempJob.supplies[j].supplier = newSupplier;
      }
    }
    // console.log(newReview);

  }
}
