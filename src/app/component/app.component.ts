import { Component } from '@angular/core';
import { Operation } from '../operation.class';
import { StreamWrapper } from '../stream-wrapper.class';
import { StreamService } from '../services/stream.service';

@Component({
    selector: 'app-root',
    styleUrls: ['./app.component.css'],
    template: `
        <div class="app-wrapper">
            <div class="app-wrapper-top">
                <div class="streams-ascii">
                    <h2>Create streams in ASCII (only cold streams)</h2>
                    <strong>Create your ascii diagrams:</strong>
                    <textarea class="form-control" [(ngModel)]="asciiStr" (keyup)="changed()"></textarea>
                </div>
                <div class="streams-settings">
                    <h2>Control panel</h2>
                    <strong>Interval:</strong>
                    <input type="number" class="form-control" [(ngModel)]="animationTime">
                    <br/>
                    <div class="btn-group">
                        <button class="btn btn-primary" (click)="start()"><i class="fa fa-play"></i>&nbsp;Start</button>
                        <button class="btn btn-danger" (click)="stop()"><i class="fa fa-stop"></i>&nbsp;Stop</button>
                    </div>
                </div>
            </div>
            <div class="app-wrapper-streams">
                <div class="stream-wrapper" *ngFor="let wrapper of streamWrappers">
                    <span class="stream-name">{{wrapper.name}}:</span>
                    <stream-row [stream]="wrapper.stream" [interval]="animationTime" [active]="active"></stream-row>
                </div>
                <div class="stream-wrapper" *ngFor="let operation of operations; let i = index;">
                    <span class="stream-name">res$:</span>
                    <stream-row class="stream-row"[stream]="operation.stream" [active]="active" [interval]="animationTime"></stream-row>
                    <div class="stream-code">
                        <pre>{{operation.code}}</pre>
                        <button class="btn btn-danger" (click)="removeOperation(operation)"><i class="fa fa-trash-o"></i></button>
                    </div>
                </div>
            </div>
            <div class="new-operation">
                <h3>Add a new operation</h3>
                <p>
                    Play around with the strams you just created, just remember the endresult to visualize is called res$
                </p>
                <codemirror [(ngModel)]="newOperation" [config]="codeMirrorConfig"></codemirror>
                <br/>
                <button class="btn btn-default" (click)="addOperation()"><i class="fa fa-plus-circle"></i>&nbsp;Add operation</button>
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

