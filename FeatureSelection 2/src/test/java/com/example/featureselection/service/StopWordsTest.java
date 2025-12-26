package com.example.featureselection.service;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class StopWordsTest {

    @Test
    public void testStopWordsFiltering() throws Exception {
        FeatureSelectionService service = new FeatureSelectionService(null, null, null, null, null, null);

        
        Method method = FeatureSelectionService.class.getDeclaredMethod("buildVocabulary", List.class, int.class);
        method.setAccessible(true);

        List<String> texts = Arrays.asList(
                "you are good",
                "this is a test",
                "call me now",
                "u are free",
                "unknownword");

        @SuppressWarnings("unchecked")
        List<String> vocabulary = (List<String>) method.invoke(service, texts, 50);

        System.out.println("Vocabulary: " + vocabulary);

        
        assertFalse(vocabulary.contains("you"), "'you' should be filtered out");
        assertFalse(vocabulary.contains("are"), "'are' should be filtered out");
        assertFalse(vocabulary.contains("this"), "'this' should be filtered out");
        assertFalse(vocabulary.contains("is"), "'is' should be filtered out");
        assertFalse(vocabulary.contains("u"), "'u' (slang) should be filtered out"); 
                                                                                     
                                                                                     
        assertFalse(vocabulary.contains("call"), "'call' should be filtered out (added to stop words)");
        assertFalse(vocabulary.contains("free"), "'free' should be filtered out (added to stop words)");

        assertTrue(vocabulary.contains("good"), "'good' should be present");
        assertTrue(vocabulary.contains("test"), "'test' should be present");
        assertTrue(vocabulary.contains("unknownword"), "'unknownword' should be present");
    }
}
