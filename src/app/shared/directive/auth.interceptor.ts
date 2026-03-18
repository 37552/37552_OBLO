import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private messageService: MessageService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const token = localStorage.getItem('userToken');

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {

                if (error.status === 401) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Unauthorized Access 401',
                        detail: 'You are not authorized to access this page.',
                        life: 3000
                    });

                    localStorage.removeItem('userToken');

                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 1500);
                }
                else if (error.status === 403) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Time Out',
                        detail: 'Your session has expired. Please login again to continue.',
                        life: 3000
                    });

                    localStorage.removeItem('userToken');

                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 1500);
                }
                else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong. Please try again later.',
                        life: 3000
                    });
                }

                return throwError(() => error);
            })
        );
    }
}
