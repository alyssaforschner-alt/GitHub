package com.example.demo;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
public class RandomWordCsvLoader implements CommandLineRunner {

    private final RandomWordService wordService;
    private final ResourceLoader resourceLoader;

    public RandomWordCsvLoader(RandomWordService wordService, ResourceLoader resourceLoader) {
        this.wordService = wordService;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(String... args) throws IOException {
        Resource csv = resourceLoader.getResource("classpath:word_pool.csv");
        if (!csv.exists()) {
            System.out.println("No word-pool.csv found on classpath, skipping random word import");
            return;
        }
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(csv.getInputStream(), StandardCharsets.UTF_8))) {
            List<String> lines = reader.lines().toList();
            int inserted = wordService.importWords(lines);
            System.out.printf("Imported %d words into word pool%n", inserted);
        }
    }
}
