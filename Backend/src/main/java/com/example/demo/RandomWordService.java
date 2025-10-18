package com.example.demo;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RandomWordService {

    private final RandomWordRepository repository;

    public RandomWordService(RandomWordRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public String randomWordValue() {
        return repository.findRandom()
                .map(RandomWord::getValue)
                .orElseThrow(() -> new IllegalStateException("No words available in pool"));
    }

    @Transactional
    public RandomWord saveWord(String rawValue) {
        String normalized = normalize(rawValue);
        validate(normalized);
        return repository.findByValue(normalized)
                .orElseGet(() -> repository.save(new RandomWord(normalized)));
    }

    @Transactional
    public int importWords(Collection<String> rawValues) {
        Set<String> unique = new LinkedHashSet<>();
        for (String raw : rawValues) {
            String normalized = normalize(raw);
            validate(normalized);
            unique.add(normalized);
        }
        int created = 0;
        for (String value : unique) {
            if (repository.findByValue(value).isEmpty()) {
                repository.save(new RandomWord(value));
                created++;
            }
        }
        return created;
    }

    private String normalize(String rawValue) {
        if (rawValue == null) {
            return "";
        }
        return rawValue.trim().toUpperCase(Locale.ROOT);
    }

    private void validate(String value) {
        if (value.length() != 5) {
            throw new IllegalArgumentException("Word must consist of exactly 5 characters");
        }
        if (!value.chars().allMatch(Character::isLetter)) {
            throw new IllegalArgumentException("Word must contain letters A-Z only");
        }
    }
}
