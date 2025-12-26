package com.example.featureselection.controller;

import com.example.featureselection.model.SelectionResult;
import com.example.featureselection.service.FeatureSelectionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/feature-selection")
public class FeatureSelectionController {

    private static final Logger log = LoggerFactory.getLogger(FeatureSelectionController.class);
    private final FeatureSelectionService featureSelectionService;

    public FeatureSelectionController(FeatureSelectionService featureSelectionService) {
        this.featureSelectionService = featureSelectionService;
    }

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<SelectionResult> analyze(
            @RequestPart("file") MultipartFile file,
            @RequestParam("targetFeature") String targetFeature,
            @RequestParam(value = "skipTextVectorization", defaultValue = "false") boolean skipTextVectorization) {

        log.info("Received analysis request: targetFeature={}, fileName={}, fileSize={}",
                targetFeature, file.getOriginalFilename(), file.getSize());

        SelectionResult result = featureSelectionService.analyze(file, targetFeature, skipTextVectorization);
        return ResponseEntity.ok(result);
    }
}
