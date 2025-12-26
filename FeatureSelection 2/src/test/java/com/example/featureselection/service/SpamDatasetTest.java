package com.example.featureselection.service;

import com.example.featureselection.model.SelectionResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SpamDatasetTest {

    @Autowired
    private FeatureSelectionService featureSelectionService;

    @Test
    void testAnalyzeSpamDataset() throws IOException {
        
        byte[] csvContent = Files.readAllBytes(Paths.get("reproduce.csv"));
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "reproduce.csv",
                "text/csv",
                csvContent);

        
        SelectionResult result = featureSelectionService.analyze(file, "v1");

        assertNotNull(result);
        System.out.println("Mode: " + result.getMode());
        System.out.println("Selected Features: " + result.getSelectedFeatures());

        
        
        assertTrue(result.getMode().contains("(Tokenized)"), "Mode should indicate '(Tokenized)'");

        
        List<String> selected = result.getSelectedFeatures();
        assertFalse(selected.contains("v2_you"), "'v2_you' should be filtered out");
        assertFalse(selected.contains("v2_the"), "'v2_the' should be filtered out");
        assertFalse(selected.contains("v2_and"), "'v2_and' should be filtered out");
        assertFalse(selected.contains("v2_is"), "'v2_is' should be filtered out");

        
        
        
        
        
        
        
        
        
        
        
        

        assertFalse(selected.contains("v2_call"), "'v2_call' should be filtered out (added to stop words)");
        assertFalse(selected.contains("v2_free"), "'v2_free' should be filtered out (added to stop words)");

        
        
        
        
        
        
        
    }
}
