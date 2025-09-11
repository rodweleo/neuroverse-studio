import {
  CreateDocumentRequest,
  DocumentInfo,
  UpdateWhitelistRequest,
  UploadProgress,
  Document,
} from "@/utils/types";
import { Principal } from "@dfinity/principal";
import { VetkeysService } from "./vet-keys.service";

export class FileService {
  private vetkeysService: VetkeysService;

  constructor(vetkeysService?: VetkeysService) {
    this.vetkeysService = vetkeysService || new VetkeysService();
  }

  // Document management methods
  async uploadDocument(
    file: File,
    whitelist: Principal[],
    myPrincipal: Principal,
    canister: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Read file data
      const fileData = new Uint8Array(await file.arrayBuffer());

      // Report initial progress
      if (onProgress) {
        onProgress({ loaded: 0, total: fileData.length, percentage: 0 });
      }

      // Encrypt the file for the owner (uploader)
      const encryptedData = await this.vetkeysService.encryptFile(
        fileData,
        myPrincipal,
        canister
      );

      // Report encryption progress
      if (onProgress) {
        onProgress({
          loaded: fileData.length * 0.5,
          total: fileData.length,
          percentage: 50,
        });
      }

      // Create document request
      const request: CreateDocumentRequest = {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        encrypted_data: encryptedData,
        whitelist: whitelist,
      };

      // Upload to canister
      const result = await canister.create_document(request);

      if ("err" in result) {
        throw new Error(result.err);
      }

      if (onProgress) {
        onProgress({
          loaded: fileData.length,
          total: fileData.length,
          percentage: 100,
        });
      }

      return result.ok;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  async downloadDocument(
    documentId: string,
    myPrincipal: Principal,
    canister: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: Uint8Array; filename: string; contentType: string }> {
    try {
      // Get document from canister
      const result = await canister.get_document(documentId);

      if ("err" in result) {
        throw new Error(result.err);
      }

      const document: Document = result.ok;
      const totalSize = Number(document.size);

      if (onProgress) {
        onProgress({ loaded: 0, total: totalSize, percentage: 0 });
      }

      // Report download progress
      if (onProgress) {
        onProgress({
          loaded: totalSize * 0.3,
          total: totalSize,
          percentage: 30,
        });
      }

      // Decrypt the file data
      const decryptedData = await this.vetkeysService.decryptFile(
        myPrincipal,
        canister,
        new Uint8Array(document.encrypted_data)
      );

      if (onProgress) {
        onProgress({
          loaded: totalSize,
          total: totalSize,
          percentage: 100,
        });
      }

      return {
        data: decryptedData,
        filename: document.filename,
        contentType: document.content_type,
      };
    } catch (error) {
      console.error("Error downloading document:", error);
      throw error;
    }
  }

  async getMyDocuments(canister: any): Promise<DocumentInfo[]> {
    try {
      const documents = await canister.get_my_documents();
      return documents;
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  }

  async updateDocumentWhitelist(
    documentId: string,
    whitelist: Principal[],
    canister: any
  ): Promise<void> {
    try {
      const request: UpdateWhitelistRequest = {
        document_id: documentId,
        whitelist: whitelist,
      };

      const result = await canister.update_whitelist(request);

      if ("err" in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error updating whitelist:", error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, canister: any): Promise<void> {
    try {
      const result = await canister.delete_document(documentId);

      if ("err" in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  async getDocumentInfo(
    documentId: string,
    canister: any
  ): Promise<DocumentInfo> {
    try {
      const result = await canister.get_document_info(documentId);

      if ("err" in result) {
        throw new Error(result.err);
      }

      return result.ok;
    } catch (error) {
      console.error("Error getting document info:", error);
      throw error;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatDate(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString();
  }

  /**
   * Get file type icon based on content type
   */
  getFileTypeIcon(contentType: string): string {
    if (contentType.startsWith("image/")) return "🖼️";
    if (contentType.startsWith("video/")) return "🎥";
    if (contentType.startsWith("audio/")) return "🎵";
    if (contentType.includes("pdf")) return "📄";
    if (contentType.includes("word") || contentType.includes("document"))
      return "📝";
    if (contentType.includes("spreadsheet") || contentType.includes("excel"))
      return "📊";
    if (
      contentType.includes("presentation") ||
      contentType.includes("powerpoint")
    )
      return "📈";
    if (contentType.includes("zip") || contentType.includes("archive"))
      return "🗜️";
    if (contentType.includes("text")) return "📃";
    return "📁";
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    maxSizeBytes: number = 50 * 1024 * 1024
  ): { valid: boolean; error?: string } {
    // Check file size (default 50MB limit)
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size (${this.formatFileSize(
          file.size
        )}) exceeds limit (${this.formatFileSize(maxSizeBytes)})`,
      };
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      return {
        valid: false,
        error: "File name cannot be empty",
      };
    }

    // Check for dangerous file extensions (security measure)
    const dangerousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".scr",
      ".pif",
      ".com",
    ];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (dangerousExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type ${fileExtension} is not allowed for security reasons`,
      };
    }

    return { valid: true };
  }
}

export const fileService = new FileService();
