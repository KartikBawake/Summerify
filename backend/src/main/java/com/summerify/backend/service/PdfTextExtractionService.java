package com.summerify.backend.service;

import com.summerify.backend.api.ApiException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;

@Service
public class PdfTextExtractionService {
    private static final byte[] PDF_SIGNATURE = "%PDF-".getBytes();

    public String extract(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose a PDF file.");
        }

        try {
            byte[] content = file.getBytes();
            if (!startsWithPdfSignature(content)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Only valid PDF files are accepted.");
            }
            try (PDDocument document = Loader.loadPDF(content)) {
                if (document.isEncrypted()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Password-protected PDFs cannot be processed.");
                }
                String text = new PDFTextStripper().getText(document).trim();
                if (text.isBlank()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "No selectable text was found in this PDF.");
                }
                return text;
            }
        } catch (ApiException exception) {
            throw exception;
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The uploaded file could not be read as a PDF.");
        }
    }

    private boolean startsWithPdfSignature(byte[] content) {
        return content.length >= PDF_SIGNATURE.length
                && Arrays.equals(Arrays.copyOf(content, PDF_SIGNATURE.length), PDF_SIGNATURE);
    }
}
