import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {

    constructor(private http: HttpClient, private config: ConfigService) { }

    // Upload one file; server returns a text string like "1-<path>" or "0-<error>"
    // uploadSingleFile(file: File, folderName: string): Observable<string> {
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     formData.append('folderName', folderName);
    //     // Adjust endpoint if your backend route is different
    //     return this.http.post(`${this.config.baseUrl}/UploadFile`, formData, { responseType: 'text' });
    // }

    // Normalize path returned by server
    normalizeImagePath(path: string): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        let p = path.replace(/\\/g, '/');
        p = p.replace(/([^:]\/)\/+/g, '$1');
        return this.config.baseUrl + p;
    }

    // utility
    getFileSize(bytes: number): string {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
