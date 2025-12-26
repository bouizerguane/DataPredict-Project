
package com.example.featureselection.service;

import com.example.featureselection.embedded.RandomForestImportance;
import com.example.featureselection.filters.ANOVAFilter;
import com.example.featureselection.filters.FCBFFilter;
import com.example.featureselection.filters.MutualInformationFilter;
import com.example.featureselection.filters.PearsonFilter;
import com.example.featureselection.model.FeatureScore;
import com.example.featureselection.model.SelectionResult;
import com.example.featureselection.wrappers.SFS;
import com.univocity.parsers.common.processor.RowListProcessor;
import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import smile.math.MathEx;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class FeatureSelectionService {

    private static final Logger log = LoggerFactory.getLogger(FeatureSelectionService.class);
    private static final int MIN_SAMPLES_FOR_WRAPPER = 10;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as",
            "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
            "down", "during",
            "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
            "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
            "how's",
            "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
            "let's", "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
            "out", "over", "own",
            "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
            "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
            "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
            "under", "until", "up", "very",
            "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
            "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
            "would", "wouldn't",
            "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",

            "le", "la", "les", "de", "des", "du", "un", "une", "et", "est", "en", "que", "qui", "dans", "pour", "sur",
            "par", "avec", "pas", "ce", "cette", "ces", "mais", "ou", "si", "ils", "elles", "nous", "vous", "il",
            "elle", "on", "ne", "se", "au", "aux", "leur", "sa", "son", "ses", "mon", "ma", "mes", "ton", "ta", "tes",
            "votre", "notre",

            "u", "ur", "4", "2", "im", "dont", "cant", "wont", "didnt", "isnt", "arent", "aint",
            "ill", "ive", "id", "youre", "youll", "youd", "shes", "hes", "its", "thatll",
            "don", "didn", "won", "isn", "aren", "couldn", "shouldn", "wouldn", "hasn", "haven", "doesn", "weren", "m",
            "s", "t", "ll", "ve", "re", "d",
            "just", "now", "know", "got", "get", "will", "can", "how", "when", "what", "free", "call", "go", "ok", "lt",
            "gt", "amp"));

    private final MutualInformationFilter miFilter;
    private final PearsonFilter pearsonFilter;
    private final ANOVAFilter anovaFilter;
    private final FCBFFilter fcbfFilter;
    private final RandomForestImportance rfImportance;
    private final SFS sfsWrapper;

    public FeatureSelectionService(MutualInformationFilter miFilter, PearsonFilter pearsonFilter,
            ANOVAFilter anovaFilter, FCBFFilter fcbfFilter,
            RandomForestImportance rfImportance, SFS sfsWrapper) {
        this.miFilter = miFilter;
        this.pearsonFilter = pearsonFilter;
        this.anovaFilter = anovaFilter;
        this.fcbfFilter = fcbfFilter;
        this.rfImportance = rfImportance;
        this.sfsWrapper = sfsWrapper;
    }

    private List<String[]> parseCsvFile(File csvFile) {
        try (FileInputStream fis = new FileInputStream(csvFile);
                InputStreamReader reader = new InputStreamReader(fis)) {
            CsvParserSettings settings = new CsvParserSettings();
            settings.setMaxCharsPerColumn(20000);
            RowListProcessor processor = new RowListProcessor();
            settings.setProcessor(processor);

            CsvParser parser = new CsvParser(settings);
            parser.parse(reader);
            return processor.getRows();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file", e);
        }
    }

    public SelectionResult analyze(MultipartFile file, String targetFeature) {
        return analyze(file, targetFeature, false);
    }

    private File writeRawTemp(MultipartFile file) throws IOException {
        File tmp = File.createTempFile("raw", ".csv");
        file.transferTo(tmp);
        return tmp;
    }

    private File preprocessWithPython(MultipartFile file) throws IOException {

        File tempInput = File.createTempFile("input", ".csv");
        file.transferTo(tempInput);
        File tempOutput = File.createTempFile("processed", ".csv");

        ProcessBuilder pb = new ProcessBuilder("python", "text_tokenizer.py",
                tempInput.getAbsolutePath(), tempOutput.getAbsolutePath());
        pb.redirectErrorStream(true);
        Process proc = pb.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(proc.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.info("[Python] {}", line);
            }
        }
        try {
            boolean finished = proc.waitFor(120, TimeUnit.SECONDS);
            if (!finished) {
                proc.destroyForcibly();
                throw new RuntimeException("Python tokenizer timed out");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Python tokenizer interrupted", e);
        }
        int exit = proc.exitValue();
        if (exit != 0) {
            throw new RuntimeException("Python tokenizer failed with exit code " + exit);
        }

        return tempOutput;
    }

    public SelectionResult analyze(MultipartFile file, String targetFeature, boolean skipTextVectorization) {
        log.info("Starting feature selection analysis for target: {} with auto-detected mode", targetFeature);
        MathEx.setSeed(42);

        try {

            File csvFile;
            if (!skipTextVectorization) {

                csvFile = preprocessWithPython(file);
            } else {

                csvFile = writeRawTemp(file);
            }

            List<String[]> rows = parseCsvFile(csvFile);

            try {
                csvFile.delete();
            } catch (Exception ignored) {
            }
            if (rows.isEmpty())
                throw new IllegalArgumentException("CSV file is empty");

            String[] headers = rows.get(0);
            rows.remove(0);

            int targetIndex = findTargetIndex(headers, targetFeature);

            List<Integer> numericCols = new ArrayList<>();
            List<Integer> textCols = new ArrayList<>();
            Set<Integer> ignoredIndices = new HashSet<>();

            for (int i = 0; i < headers.length; i++) {
                if (i == targetIndex)
                    continue;
                String h = headers[i].toLowerCase();
                if (h.equals("id") || h.startsWith("id_") || h.endsWith("_id") || h.contains("matricule")) {
                    ignoredIndices.add(i);
                    log.info("Ignoring probable ID feature: {}", headers[i]);
                    continue;
                }

                if (isNumericColumn(rows, i)) {
                    numericCols.add(i);
                } else {
                    textCols.add(i);
                }
            }

            if (skipTextVectorization && !textCols.isEmpty()) {
                List<String> textColumnNames = new ArrayList<>();
                for (int idx : textCols) {
                    textColumnNames.add(headers[idx]);
                }
                throw new IllegalArgumentException(
                        "Dataset contains text columns: " + textColumnNames +
                                ". This API only supports numeric features when skipTextVectorization=true. " +
                                "Please provide a dataset with only numeric columns, or set skipTextVectorization=false to enable automatic text vectorization.");
            }

            int sampleCount = rows.size();

            boolean isClassification = detectMode(rows, targetIndex);
            String modeString = isClassification ? "CLASSIFICATION" : "REGRESSION";
            if (!textCols.isEmpty()) {
                modeString += "";
            }
            log.info("Detected mode: {}", modeString);

            Object y = isClassification ? new int[sampleCount] : new double[sampleCount];
            Map<String, Integer> labelMap = new HashMap<>();

            for (int i = 0; i < sampleCount; i++) {
                String val = getVal(rows.get(i), targetIndex);
                if (isClassification) {
                    labelMap.putIfAbsent(val, labelMap.size());
                    ((int[]) y)[i] = labelMap.get(val);
                } else {
                    ((double[]) y)[i] = parseDoubleSafe(val);
                }
            }

            List<double[]> featureColumns = new ArrayList<>();
            List<String> finalFeatureNamesList = new ArrayList<>();

            for (int colIdx : numericCols) {
                finalFeatureNamesList.add(headers[colIdx]);
                double[] colData = new double[sampleCount];
                for (int i = 0; i < sampleCount; i++) {
                    colData[i] = parseDoubleSafe(getVal(rows.get(i), colIdx));
                }
                featureColumns.add(colData);
            }

            for (int colIdx : textCols) {
                List<String> rawText = new ArrayList<>();
                for (String[] r : rows)
                    rawText.add(getVal(r, colIdx));

                List<String> vocabulary = buildVocabulary(rawText, 30);

                for (String term : vocabulary) {
                    finalFeatureNamesList.add(headers[colIdx] + "_" + term);
                    double[] termCol = new double[sampleCount];
                    for (int i = 0; i < sampleCount; i++) {
                        termCol[i] = countTerm(rawText.get(i), term);
                    }
                    featureColumns.add(termCol);
                }
            }

            int featureCount = finalFeatureNamesList.size();
            String[] featureNames = finalFeatureNamesList.toArray(new String[0]);
            double[][] x = new double[sampleCount][featureCount];

            for (int i = 0; i < sampleCount; i++) {
                for (int j = 0; j < featureCount; j++) {
                    x[i][j] = featureColumns.get(j)[i];
                }
            }

            Map<String, Double> miScores;
            Map<String, Double> pearsonScores;
            Map<String, Double> anovaScores;
            Map<String, Double> rfScores;
            List<String> fcbfSelected;

            if (isClassification) {
                int[] yInt = (int[]) y;
                miScores = normalize(miFilter.calculate(x, yInt, featureNames));
                pearsonScores = normalize(pearsonFilter.calculate(x, yInt, featureNames));
                anovaScores = normalize(anovaFilter.calculate(x, yInt, featureNames));
                try {
                    rfScores = normalize(rfImportance.calculate(x, yInt, featureNames));
                } catch (Exception e) {
                    log.warn("Random Forest importance calculation failed (classification): {}", e.getMessage());
                    rfScores = new HashMap<>();
                }
                fcbfSelected = fcbfFilter.calculate(x, yInt, featureNames);
            } else {
                double[] yDouble = (double[]) y;
                miScores = normalize(miFilter.calculate(x, yDouble, featureNames));
                pearsonScores = normalize(pearsonFilter.calculate(x, yDouble, featureNames));
                anovaScores = normalize(anovaFilter.calculate(x, yDouble, featureNames));

                try {
                    rfScores = normalize(rfImportance.calculate(x, yDouble, featureNames));
                } catch (Exception e) {
                    log.warn("Random Forest importance calculation failed (regression): {}", e.getMessage());
                    rfScores = new HashMap<>();
                }

                fcbfSelected = fcbfFilter.calculate(x, yDouble, featureNames);
            }

            List<FeatureScore> featureScoreList = new ArrayList<>();
            Map<String, Double> finalScoresMap = new HashMap<>();

            for (String name : featureNames) {
                double mi = miScores.getOrDefault(name, 0.0);
                double pearson = pearsonScores.getOrDefault(name, 0.0);
                double anova = anovaScores.getOrDefault(name, 0.0);
                double rf = rfScores.getOrDefault(name, 0.0);

                double finalScore = 0.30 * mi + 0.20 * pearson + 0.20 * anova + 0.30 * rf;
                finalScoresMap.put(name, finalScore);

                String explanation = "";

                if (mi == 0 && pearson == 0 && anova == 0 && rf == 0) {
                    explanation = "Rejected: all metrics zero";
                }

                if (fcbfSelected.contains(name)) {
                    explanation += (explanation.isEmpty() ? "" : ", ") + "Selected by FCBF";
                }

                FeatureScore fs = FeatureScore.builder()
                        .featureName(name)
                        .miScore(mi)
                        .pearsonScore(pearson)
                        .anovaScore(anova)
                        .rfImportance(rf)
                        .finalScore(finalScore)
                        .explanation(explanation)
                        .build();
                featureScoreList.add(fs);
            }

            Set<String> sfsSelectedNames = new HashSet<>();
            if (sampleCount >= MIN_SAMPLES_FOR_WRAPPER) {
                List<Integer> sfsIndices;
                if (isClassification) {
                    sfsIndices = sfsWrapper.select(x, (int[]) y);
                } else {
                    sfsIndices = sfsWrapper.select(x, (double[]) y);
                }
                for (int idx : sfsIndices) {
                    sfsSelectedNames.add(featureNames[idx]);
                }
            } else {
                log.info("Skipping SFS: Sample count {} < MIN_SAMPLES_FOR_WRAPPER {}", sampleCount,
                        MIN_SAMPLES_FOR_WRAPPER);
            }

            for (FeatureScore fs : featureScoreList) {
                boolean sfsSel = sfsSelectedNames.contains(fs.getFeatureName());
                boolean fcbfSel = fcbfSelected.contains(fs.getFeatureName());
                boolean hasScore = fs.getFinalScore() >= 0.10;

                if (sfsSel) {
                    String currentExpl = fs.getExplanation();
                    if (!currentExpl.contains("Selected by SFS")) {
                        if (currentExpl.isEmpty())
                            fs.setExplanation("Selected by SFS");
                        else
                            fs.setExplanation(currentExpl + ", Selected by SFS");
                    }
                }

                if (sfsSel || fcbfSel || hasScore) {
                    fs.setSelected(true);
                    if (hasScore && fs.getExplanation().isEmpty()) {
                        fs.setExplanation("Selected by Final Score");
                    }
                } else {
                    fs.setSelected(false);
                    if (fs.getExplanation().isEmpty()) {
                        fs.setExplanation("Rejected: Low score and not selected by wrappers");
                    }
                }
            }

            List<FeatureScore> aggregatedScores = new ArrayList<>();
            List<String> finalSelected = new ArrayList<>();
            List<String> finalRejected = new ArrayList<>();

            Map<String, List<FeatureScore>> textColTokens = new HashMap<>();

            Map<String, FeatureScore> numericScores = new HashMap<>();

            for (FeatureScore fs : featureScoreList) {
                String name = fs.getFeatureName();
                boolean isTextToken = false;
                String originCol = null;

                for (int tIdx : textCols) {
                    String colName = headers[tIdx];
                    if (name.startsWith(colName + "_")) {
                        isTextToken = true;
                        originCol = colName;
                        break;
                    }
                }

                if (isTextToken) {
                    textColTokens.computeIfAbsent(originCol, k -> new ArrayList<>()).add(fs);
                } else {
                    numericScores.put(name, fs);
                }
            }

            for (int idx : numericCols) {
                String name = headers[idx];
                if (numericScores.containsKey(name)) {
                    FeatureScore fs = numericScores.get(name);
                    aggregatedScores.add(fs);
                    if (fs.isSelected())
                        finalSelected.add(name);
                    else
                        finalRejected.add(name);
                }
            }

            for (int idx : textCols) {
                String name = headers[idx];
                List<FeatureScore> tokens = textColTokens.get(name);

                if (tokens == null || tokens.isEmpty()) {

                    FeatureScore emptyFs = FeatureScore.builder()
                            .featureName(name)
                            .finalScore(0.0)
                            .explanation("Rejected: No usable text tokens found")
                            .selected(false)
                            .build();
                    aggregatedScores.add(emptyFs);
                    finalRejected.add(name);
                    continue;
                }

                boolean anySelected = tokens.stream().anyMatch(FeatureScore::isSelected);
                double maxScore = tokens.stream().mapToDouble(FeatureScore::getFinalScore).max().orElse(0.0);

                String explanation;
                if (anySelected) {

                    String topTokens = tokens.stream()
                            .filter(FeatureScore::isSelected)
                            .sorted(Comparator.comparingDouble(FeatureScore::getFinalScore).reversed())
                            .limit(3)
                            .map(fs -> fs.getFeatureName().replace(name + "_", ""))
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("");
                    explanation = "Selected due to key terms: " + topTokens;
                } else {
                    explanation = "Rejected: No significant terms found";
                }

                FeatureScore aggFs = FeatureScore.builder()
                        .featureName(name)
                        .finalScore(maxScore)

                        .miScore(tokens.stream().mapToDouble(FeatureScore::getMiScore).max().orElse(0.0))
                        .pearsonScore(tokens.stream().mapToDouble(FeatureScore::getPearsonScore).max().orElse(0.0))
                        .anovaScore(tokens.stream().mapToDouble(FeatureScore::getAnovaScore).max().orElse(0.0))
                        .rfImportance(tokens.stream().mapToDouble(FeatureScore::getRfImportance).max().orElse(0.0))
                        .explanation(explanation)
                        .selected(anySelected)
                        .build();

                aggregatedScores.add(aggFs);
                if (anySelected)
                    finalSelected.add(name);
                else
                    finalRejected.add(name);
            }

            aggregatedScores.sort(Comparator.comparingDouble(FeatureScore::getFinalScore).reversed());

            return SelectionResult.builder()
                    .selectedFeatures(finalSelected)
                    .rejectedFeatures(finalRejected)
                    .featureScores(aggregatedScores)
                    .mode(modeString)
                    .build();

        } catch (Exception e) {
            log.error("Error during analysis", e);
            throw new RuntimeException("Analysis failed: " + e.getMessage(), e);
        }
    }

    private List<String[]> parseCsv(MultipartFile file) {
        try {
            CsvParserSettings settings = new CsvParserSettings();
            settings.setMaxCharsPerColumn(20000);
            RowListProcessor processor = new RowListProcessor();
            settings.setProcessor(processor);

            CsvParser parser = new CsvParser(settings);
            parser.parse(new InputStreamReader(file.getInputStream()));
            return processor.getRows();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV", e);
        }
    }

    private int findTargetIndex(String[] headers, String target) {
        for (int i = 0; i < headers.length; i++) {
            if (headers[i].equalsIgnoreCase(target))
                return i;
        }
        throw new IllegalArgumentException("Target feature '" + target + "' not found in dataset");
    }

    private Map<String, Double> normalize(Map<String, Double> scores) {
        if (scores.isEmpty())
            return scores;

        double max = Collections.max(scores.values());

        if (max < 1e-9) {

            Map<String, Double> normalized = new HashMap<>();
            for (String key : scores.keySet()) {
                normalized.put(key, 0.0);
            }
            return normalized;
        }

        Map<String, Double> normalized = new HashMap<>();
        for (Map.Entry<String, Double> entry : scores.entrySet()) {
            double val = entry.getValue();

            normalized.put(entry.getKey(), val / max);
        }
        return normalized;
    }

    private boolean detectMode(List<String[]> rows, int targetIndex) {
        Set<String> uniqueValues = new HashSet<>();
        boolean allNumeric = true;

        int maxUniqueForClassification = 10;

        for (String[] row : rows) {
            if (row.length <= targetIndex)
                continue;
            String val = row[targetIndex];
            if (val == null || val.trim().isEmpty())
                continue;

            val = val.trim();
            uniqueValues.add(val);

            if (allNumeric) {
                try {
                    Double.parseDouble(val);
                } catch (NumberFormatException e) {
                    allNumeric = false;
                }
            }
        }

        if (!allNumeric) {
            return true;
        }

        return uniqueValues.size() <= maxUniqueForClassification;
    }

    private String getVal(String[] row, int index) {
        if (row == null || index < 0 || index >= row.length || row[index] == null) {
            return "";
        }
        return row[index].trim();
    }

    private double parseDoubleSafe(String val) {
        if (val == null || val.isEmpty())
            return 0.0;
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private boolean isNumericColumn(List<String[]> rows, int colIndex) {
        int checkCount = 0;
        int maxChecks = 20;
        for (String[] row : rows) {
            String val = getVal(row, colIndex);
            if (!val.isEmpty()) {
                try {
                    Double.parseDouble(val);
                    checkCount++;
                } catch (NumberFormatException e) {
                    return false;
                }
            }
            if (checkCount >= maxChecks)
                return true;
        }

        return true;
    }

    private List<String> buildVocabulary(List<String> texts, int limit) {
        Map<String, Integer> freq = new HashMap<>();
        for (String text : texts) {
            if (text == null || text.isEmpty())
                continue;

            String cleanedText = cleanText(text);

            String[] tokens = cleanedText.toLowerCase().split("\\W+");
            for (String token : tokens) {

                if (token.length() > 2 && !isNumeric(token) && !STOP_WORDS.contains(token)) {
                    freq.put(token, freq.getOrDefault(token, 0) + 1);
                }
            }
        }

        List<Map.Entry<String, Integer>> list = new ArrayList<>(freq.entrySet());
        list.sort(Map.Entry.<String, Integer>comparingByValue().reversed());

        List<String> topTerms = new ArrayList<>();

        int finalLimit = Math.min(list.size(), limit);
        for (int i = 0; i < finalLimit; i++) {
            topTerms.add(list.get(i).getKey());
        }
        log.info("Built vocabulary (limit {}): {}", limit, topTerms);
        return topTerms;
    }

    private double countTerm(String text, String term) {
        if (text == null || text.isEmpty())
            return 0.0;

        String cleanedText = cleanText(text);
        String[] tokens = cleanedText.toLowerCase().split("\\W+");
        int count = 0;
        for (String t : tokens) {
            if (t.equals(term))
                count++;
        }
        return count;
    }

    private String cleanText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        return text.replaceAll("[,;\"'`]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean isNumeric(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
