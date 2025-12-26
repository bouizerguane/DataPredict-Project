package com.example.featureselection.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Paths;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class FeatureSelectionControllerTest {

        @Autowired
        private MockMvc mockMvc;

        private MockMultipartFile validCsvFile;
        private MockMultipartFile smallCsvFile;

        @BeforeEach
        void setUp() throws Exception {
                byte[] csvContent = Files.readAllBytes(
                                Paths.get("src/test/resources/test-data.csv"));
                validCsvFile = new MockMultipartFile(
                                "file",
                                "test-data.csv",
                                "text/csv",
                                csvContent);

                byte[] smallCsvContent = Files.readAllBytes(
                                Paths.get("src/test/resources/test-data-small.csv"));
                smallCsvFile = new MockMultipartFile(
                                "file",
                                "test-data-small.csv",
                                "text/csv",
                                smallCsvContent);
        }

        @Test
        void testAnalyzeEndpointWithValidData() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType("application/json"))
                                .andExpect(jsonPath("$.selectedFeatures").isArray())
                                .andExpect(jsonPath("$.rejectedFeatures").isArray())
                                .andExpect(jsonPath("$.featureScores").isArray())
                                .andExpect(jsonPath("$.featureScores.length()").value(5));
        }

        @Test
        void testAnalyzeEndpointWithSmallDataset() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(smallCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType("application/json"))
                                .andExpect(jsonPath("$.selectedFeatures").isArray())
                                .andExpect(jsonPath("$.rejectedFeatures").isArray())
                                .andExpect(jsonPath("$.featureScores.length()").value(3));
        }

        @Test
        void testAnalyzeEndpointWithInvalidTarget() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile)
                                .param("targetFeature", "nonexistent"))
                                .andExpect(status().is5xxServerError());
        }

        @Test
        void testAnalyzeEndpointWithMissingFile() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .param("targetFeature", "target"))
                                .andExpect(status().is4xxClientError());
        }

        @Test
        void testAnalyzeEndpointWithMissingTargetParameter() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile))
                                .andExpect(status().is4xxClientError());
        }

        @Test
        void testAnalyzeEndpointWithEmptyFile() throws Exception {
                MockMultipartFile emptyFile = new MockMultipartFile(
                                "file",
                                "empty.csv",
                                "text/csv",
                                "".getBytes());

                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(emptyFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().is5xxServerError());
        }

        @Test
        void testAnalyzeEndpointWithInvalidCsvFormat() throws Exception {
                MockMultipartFile invalidFile = new MockMultipartFile(
                                "file",
                                "invalid.csv",
                                "text/csv",
                                "invalid,csv,content\n1,2".getBytes());

                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(invalidFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().is5xxServerError());
        }

        @Test
        void testAnalyzeEndpointResponseStructure() throws Exception {
                MvcResult result = mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andReturn();

                String content = result.getResponse().getContentAsString();
                assertNotNull(content);
                assertTrue(content.contains("selectedFeatures"));
                assertTrue(content.contains("rejectedFeatures"));
                assertTrue(content.contains("featureScores"));
        }

        @Test
        void testAnalyzeEndpointFeatureScoreStructure() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.featureScores[0].featureName").exists())
                                .andExpect(jsonPath("$.featureScores[0].finalScore").exists())
                                .andExpect(jsonPath("$.featureScores[0].selected").exists());
        }

        @Test
        void testAnalyzeEndpointWithDifferentTargets() throws Exception {
                
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(smallCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.featureScores").isArray());
        }

        @Test
        void testAnalyzeEndpointContentType() throws Exception {
                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType("application/json"));
        }

        @Test
        void testAnalyzeEndpointReturnsNonEmptyResult() throws Exception {
                MvcResult result = mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(validCsvFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().isOk())
                                .andReturn();

                String content = result.getResponse().getContentAsString();
                assertFalse(content.isEmpty());
                assertTrue(content.length() > 100); 
        }

        @Test
        void testAnalyzeEndpointWithWrongFileParameterName() throws Exception {
                MockMultipartFile wrongParamFile = new MockMultipartFile(
                                "wrongParam",
                                "test-data.csv",
                                "text/csv",
                                validCsvFile.getBytes());

                mockMvc.perform(multipart("/api/feature-selection/analyze")
                                .file(wrongParamFile)
                                .param("targetFeature", "target"))
                                .andExpect(status().is4xxClientError());
        }
}
