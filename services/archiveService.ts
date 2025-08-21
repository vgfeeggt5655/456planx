
// WARNING: API keys should not be stored in client-side code. They should be
// accessed from environment variables provided by the deployment platform.
// In a production environment, file uploads and API interactions with secret keys
// should always be handled by a secure backend server.

const ACCESS_KEY = process?.env?.ARCHIVE_ACCESS_KEY || '';
const SECRET_KEY = process?.env?.ARCHIVE_SECRET_KEY || '';

type MediaType = 'movies' | 'texts' | 'image';

const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith('video/')) return 'movies';
    if (file.type === 'application/pdf') return 'texts';
    if (file.type.startsWith('image/')) return 'image';
    return 'texts'; // Default
};

/**
 * Uploads a file to Internet Archive's S3-like storage.
 * @param file The file to upload.
 * @param itemName A unique identifier for the Internet Archive item (bucket).
 * @param onProgress A callback function to report upload progress (0-100).
 * @returns A promise that resolves with the public URL of the uploaded file.
 */
export const uploadFile = (
    file: File,
    itemName: string,
    onProgress: (percent: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!ACCESS_KEY || !SECRET_KEY) {
            const errorMessage = "Archive service API keys are not configured. Please set ARCHIVE_ACCESS_KEY and ARCHIVE_SECRET_KEY environment variables.";
            console.error(errorMessage);
            reject(new Error(errorMessage));
            return;
        }

        const url = `https://s3.us.archive.org/${itemName}/${encodeURIComponent(file.name)}`;
        const mediaType = getMediaType(file);

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);

        // Set required headers for Internet Archive S3 API
        xhr.setRequestHeader('Authorization', `LOW ${ACCESS_KEY}:${SECRET_KEY}`);
        xhr.setRequestHeader('x-amz-auto-make-bucket', '1');
        xhr.setRequestHeader('x-archive-meta-collection', 'opensource');
        xhr.setRequestHeader('x-archive-meta-mediatype', mediaType);
        xhr.setRequestHeader('Content-Type', file.type);

        // Track upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                onProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                // The public URL is different from the upload URL
                const publicUrl = `https://archive.org/download/${itemName}/${encodeURIComponent(file.name)}`;
                resolve(publicUrl);
            } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during upload.'));
        };

        xhr.send(file);
    });
};