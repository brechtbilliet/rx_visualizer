import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Component({
    selector: 'app-root',
    template: `        
        <div class="container">
            <div class="row">
                <div class="col-sm-6">
                    <h2>Streams</h2>
                    <div class="row">
                        <textarea class="form-control" [(ngModel)]="asciiStr" (keyup)="changed()"></textarea>
                        <div *ngFor="let wrapper of streamWrappers">
                            {{wrapper.operation.result}}
                        </div>
                    </div>
                    <div *ngFor="let operation of operations; let i = index">
                        <div class="row">
                            <div class="col-sm-10">
                                <pre>{{operation.code}}</pre>
                            </div>
                            <div class="col-sm-2">
                                <button class="btn btn-danger btn-block" (click)="removeOperation(operation)">Remove</button>
                            </div>
                        </div>
                        <div class="row">
                            {{operation?.result}}
                        </div>
                    </div>
                    <button class="btn btn-primary" (click)="renderAll()">Start</button>
                </div>
                <div class="col-sm-6">
                    <h2>Operations</h2>
                    <blockquote>The stream at your left is called <strong>obs$</strong>, use some operations to visualize the changes</blockquote>
                    <codemirror [(ngModel)]="newOperation" [config]="codeMirrorConfig"></codemirror>
                    <button class="btn btn-primary" (click)="addOperation()">Add operation</button>
                </div>
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
    asciiStr = "a$:----1----2----3-----4---...\nb$:---5--6----1-----1---...";
    result = "";
    operations: Array<Operation> = [];
    newOperation = `
    let temp$ = a$.map(item => item * 2);
    res$ = b$.map(item => item + 2).merge(a$);

`;
    streamWrappers: Array<{name: string, stream: Observable<any>, operation: Operation}> = [];
    initial$;

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
        console.log(str);
        return Observable.create((observer: Observer<any>) => {
            let infinite = str.indexOf('...') > -1;
            str = str.replace('...', '');
            for (let i = 0; i < str.length; i++) {
                if (str[i] !== '-') {
                    setTimeout(() => {
                        observer.next(str[i]);
                    }, i * this.animationTime);
                }
                if (i === str.length - 1 && infinite) {
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
        this.renderAll();
    }

    renderAll(): void {
        this.streamWrappers.forEach(wrapper => wrapper.operation.destroy());
        this.operations.forEach(operation => operation.destroy());
        this.operations.forEach(operation => operation.draw());
        this.streamWrappers.forEach(wrapper => wrapper.operation.draw());
    }

    removeOperation(operation: Operation): void {
        operation.destroy();
        this.operations = this.operations.filter(o => o !== operation);
    }
}

class Operation {
    result? = '';

    private subscriptions = [];
    private interval;

    constructor(public stream: Observable<any>, public code?: string) {

    }

    draw(): void {
        this.result = '';
        this.cleanup();
        this.interval = setInterval(() => {
            this.result += '-';
        }, 200);
        this.subscriptions.push(this.stream.subscribe((e) => {
            this.result += e;
        }));
    }

    private cleanup(): void {
        clearInterval(this.interval);
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    destroy(): void {
        this.cleanup();
    }
}