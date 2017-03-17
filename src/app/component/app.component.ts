import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Operation } from '../operation.class';
import { StreamWrapper } from '../stream-wrapper.class';
import { StreamService } from '../services/stream.service';

@Component({
    selector: 'app-root',
    template: `
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-12">
                    <h2>Streams (only cold streams)</h2>
                    <input type="number" class="form-control" [(ngModel)]="animationTime">
                    <textarea class="form-control" [(ngModel)]="asciiStr" (keyup)="changed()"></textarea>
                    <table class="table table-hover table-striped">
                        <tr *ngFor="let wrapper of streamWrappers">
                            <td>{{wrapper.name}}</td> 
                            <td style="width: 100%">
                                <stream-row [stream]="wrapper.stream" [interval]="animationTime" [active]="active"></stream-row>
                            </td>
                            <td></td>
                        </tr>
                        <tr *ngFor="let operation of operations; let i = index">
                            <td>r$</td>
                            <td style="width: 100%">
                                <stream-row [stream]="operation.stream" [active]="active" [interval]="animationTime"></stream-row>
                            </td>
                            <td>
                                <pre>{{operation.code}}</pre>
                                <button class="btn btn-danger btn-sm" (click)="removeOperation(operation)"><i class="fa fa-trash-o"></i></button>
                                <button class="btn btn-primary btn-sm"><i class="fa fa-pencil"></i></button>
                            </td>
                        </tr>
                    </table>
                    
                </div>
                <div class="col-sm-12">
                <br/>
                    <button class="btn btn-primary" (click)="start()">Start</button>
                    <button class="btn btn-default" (click)="stop()">Stop</button>
                </div>
            </div>
            <div class="col-sm-6 col-sm-offset-6">
                <h2>Add a new operation</h2>
                <blockquote>The stream at your left is called <strong>obs$</strong>, use some operations to visualize the
                    changes
                </blockquote>
                <codemirror [(ngModel)]="newOperation" [config]="codeMirrorConfig"></codemirror>
                <button class="btn btn-primary" (click)="addOperation()">Add operation</button>
            </div>
        </div>
`
})
export class AppComponent {
    animationTime = 200;
    active = false;
    codeMirrorConfig = {
        lineNumbers: true,
        matchBrackets: true,
        mode: "text/typescript"
    };
    asciiStr = "a$:-------(1)------(2)-------(3)--------(4)|\nb$:--(5)-----(6)-------(1)--------(1)---...";
    operations: Array<Operation> = [];
    newOperation = `
    let temp$ = a$.map(item => item * 2);
    res$ = b$.map(item => item + 2).merge(temp$);

`;
    streamWrappers: Array<StreamWrapper> = [];

    changed(): void {
        this.operations = [];
        this.active = false;
        try {
            this.streamWrappers = this.streamService.calculateStreamWrappers(this.asciiStr, this);
        } catch (e) {
        }
    }

    constructor(private streamService: StreamService) {
        this.changed();
    }

    addOperation(): void {
        this.active = false;
        this.streamWrappers.forEach((wrapper) => {
            window[wrapper.name] = wrapper.stream
        });
        window["res$"] = null;
        eval(this.newOperation);
        this.operations.push(new Operation(window['res$'], this.newOperation));
    }

    start(): void {
        this.active = true;
    }

    stop(): void {
        this.active = false;
    }

    removeOperation(operation: Operation): void {
        this.active = false;
        this.operations = this.operations.filter(o => o !== operation);
    }
}

