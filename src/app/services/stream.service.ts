import { StreamWrapper } from '../stream-wrapper.class';
import { Observable, Observer } from 'rxjs';
import { Injectable } from '@angular/core';
@Injectable()
export class StreamService{
    calculateStreamWrappers(str: string, options: {animationTime: number}): Array<StreamWrapper> {
        return str.split('\n').map(line => {
            let splitted = line.split(':');
            let stream = this.streamFromMarble(splitted[1], options);
            return new StreamWrapper(splitted[0], stream);
        });
    }

    private streamFromMarble(str: string, options: {animationTime: number}): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            const infinite = str.indexOf('...') > -1;
            const values = str.split('(')
                .filter(item => item.indexOf(')') > -1)
                .map(item => Number(item.split(')')[0]));
            let timeCtr = 0;
            for (let i = 0; i < str.replace('...', '').length; i++) {
                // if(str[i] === '-'){
                    timeCtr++;
                // }
                if (str[i] === '(') {
                    setTimeout(() => {
                        observer.next(values.shift());
                    }, timeCtr * options.animationTime);
                    const isLastValue = str.substr(i + 1).indexOf('(') === -1 && str.substr(i + 1).indexOf('-') === -1;
                    if(isLastValue){
                        setTimeout(() => {
                            observer.complete();
                        }, timeCtr * options.animationTime);
                    }
                }
            }
        });
    }
}