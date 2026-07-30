package com.summerify.backend.api;

import com.summerify.backend.service.PdfTextExtractionService;
import com.summerify.backend.service.SummarizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class SummarizationController {
    private final SummarizationService summarizationService;
    private final PdfTextExtractionService pdfTextExtractionService;

    public SummarizationController(SummarizationService summarizationService,
                                   PdfTextExtractionService pdfTextExtractionService) {
        this.summarizationService = summarizationService;
        this.pdfTextExtractionService = pdfTextExtractionService;
    }

    @PostMapping("/summaries")
    public SummaryResponse summarize(@Valid @RequestBody SummarizeRequest request) {
        return new SummaryResponse(summarizationService.summarize(request.text(), request.ratio()));
    }

    @PostMapping("/documents/extract")
    public ResponseEntity<TextResponse> extractPdf(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(new TextResponse(pdfTextExtractionService.extract(file)));
    }
}
