import { Component } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';
import { Operation } from './operation.class';

@Component({
    selector: 'app-root',
    template: `<div class="container">
    <div class="row">
        <div class="col-sm-12">
            <h2>Streams</h2>
            <textarea class="form-control" [(ngModel)]="asciiStr" (keyup)="changed()"></textarea>
            <table class="table table-hover table-striped">
                <tr *ngFor="let wrapper of streamWrappers">
                    <td>{{wrapper.name}}</td> 
                    <td style="width: 100%">{{wrapper.operation.result}}</td>
                    <td></td>
                </tr>
                <tr *ngFor="let operation of operations; let i = index">
                    <td>r$</td>
                    <td style="width: 100%">{{operation?.result}}</td>
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
    private animationTime = 200;
    codeMirrorConfig = {
        lineNumbers: true,
        matchBrackets: true,
        mode: "text/typescript"
    };
    asciiStr = "a$:----(1)----(2)----(3)-----(4)---...\nb$:---(5)--(6)----(1)-----(1)---...";
    result = "";
    operations: Array<Operation> = [];
    newOperation = `
    let temp$ = a$.map(item => item * 2);
    res$ = b$.map(item => item + 2).merge(temp$);

`;
    streamWrappers: Array<{name: string, stream: Observable<any>, operation: Operation}> = [];

    changed(): void {
        let lines = this.asciiStr.split('\n');
        this.streamWrappers = lines.map(line => {
            let splitted = line.split(':');
            let stream = this.streamFromMarble(splitted[1]);
            return {name: splitted[0], stream, operation: new Operation(stream)}
        });
    }

    constructor() {
        this.changed();
    }

    streamFromMarble(str: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            const infinite = str.indexOf('...') > -1;
            const values = str.split('(')
                .filter(item => item.indexOf(')') > -1)
                .map(item => Number(item.split(')')[0]));
            for (let i = 0; i < str.replace('...', '').length; i++) {
                if (str[i] === '(') {
                    setTimeout(() => {
                        observer.next(values.shift());
                    }, i * this.animationTime);
                }
                if (i === str.length - 1 && !infinite) {
                    setTimeout(() => {
                        observer.complete();
                    }, i * this.animationTime);
                }
            }
        });
    }

    addOperation(): void {
        this.streamWrappers.forEach((wrapper) => {
            window[wrapper.name] = wrapper.stream
        });
        window["res$"] = null;
        eval(this.newOperation);
        this.operations.push(new Operation(window['res$'], this.newOperation));
    }

    start(): void {
        this.streamWrappers.forEach(wrapper => wrapper.operation.destroy());
        this.operations.forEach(operation => operation.destroy());
        this.operations.forEach(operation => operation.draw());
        this.streamWrappers.forEach(wrapper => wrapper.operation.draw());
    }

    stop(): void {
        this.streamWrappers.forEach(wrapper => wrapper.operation.destroy());
        this.operations.forEach(operation => operation.destroy());
    }

    removeOperation(operation: Operation): void {
        operation.destroy();
        this.operations = this.operations.filter(o => o !== operation);
    }
}

