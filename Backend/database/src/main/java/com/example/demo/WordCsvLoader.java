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
public class WordCsvLoader implements CommandLineRunner {

    private final WordService wordService;
    private final ResourceLoader resourceLoader;

    public WordCsvLoader(WordService wordService, ResourceLoader resourceLoader) {
        this.wordService = wordService;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(String... args) throws IOException {
        Resource csv = resourceLoader.getResource("classpath:wörter.csv");
        if (!csv.exists()) {
            System.out.println("No words.csv found on classpath, skipping import");
            return;
        }
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(csv.getInputStream(), StandardCharsets.UTF_8))) {
            List<String> lines = reader.lines().toList();
            int inserted = wordService.importWords(lines);
            System.out.printf("Imported %d words from CSV%n", inserted);
        }
    }
}
