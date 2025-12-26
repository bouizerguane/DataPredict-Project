package com.aipredict.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthCheckController {

    private final WebClient webClient;

    public HealthCheckController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @GetMapping("/health/all")
    public Mono<Map<String, Object>> getAllServiceHealth() {
        
        

        Mono<Object> preprocessingHealth = checkServiceHealth("lb://preprocessing-service/actuator/health");
        Mono<Object> featureSelectionHealth = checkServiceHealth("lb://featureselection-service/actuator/health");
        Mono<Object> recommendationHealth = checkServiceHealth("lb://modelrecommendation-service/health");
        Mono<Object> authHealth = checkServiceHealth("lb://auth-service/actuator/health");

        return Mono.zip(preprocessingHealth, featureSelectionHealth, recommendationHealth, authHealth)
                .map(tuple -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("preprocessing-service", tuple.getT1());
                    result.put("featureselection-service", tuple.getT2());
                    result.put("modelrecommendation-service", tuple.getT3());
                    result.put("auth-service", tuple.getT4());
                    
                    result.put("api-gateway", "UP");
                    return result;
                });
    }

    private Mono<Object> checkServiceHealth(String url) {
        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(Object.class)
                .map(response -> (Object) "UP") 
                .onErrorResume(e -> Mono.just("DOWN"));
    }
}
