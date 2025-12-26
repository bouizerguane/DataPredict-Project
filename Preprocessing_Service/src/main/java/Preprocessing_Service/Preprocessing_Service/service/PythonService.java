package Preprocessing_Service.Preprocessing_Service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class PythonService {

    @Value("${app.python.command:python}")
    private String pythonCommand;

    @Value("${app.python.script-path}")
    private String scriptPath;

    public String executeScript(String scriptName, String operation, String inputFile, String outputFile, String params)
            throws IOException, InterruptedException {
        
        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath + scriptName);
        command.add(operation);
        command.add(inputFile);
        command.add(outputFile == null ? "NONE" : outputFile);
        command.add(params == null ? "{}" : params);

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();

        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Python script execution failed. Output: " + output.toString());
        }

        return output.toString();
    }

    public String analyzeDataset(String filePath) throws IOException, InterruptedException {
        
        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath + "analyze_dataset.py");
        command.add(filePath);

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();

        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Dataset analysis failed. Output: " + output.toString());
        }

        return output.toString();
    }

    public String analyzeTextWithNLP(String filePath, List<String> textColumns)
            throws IOException, InterruptedException {
        
        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath + "nlp_processor.py");
        command.add("nlp_analyze");
        command.add(filePath);
        command.add("NONE");

        
        String params = "{\"columns\": "
                + new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(textColumns) + "}";
        command.add(params);

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();

        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("NLP analysis failed. Output: " + output.toString());
        }

        return output.toString();
    }
}
