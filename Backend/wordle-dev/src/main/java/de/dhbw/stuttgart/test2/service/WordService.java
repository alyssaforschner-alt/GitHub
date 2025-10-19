package de.dhbw.stuttgart.test2.service;


import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.springframework.stereotype.Service;

import de.dhbw.stuttgart.test2.model.Word;
import de.dhbw.stuttgart.test2.repository.WordRepository;
import jakarta.transaction.Transactional;



import java.util.Locale;

@Service
public class WordService 
{
	private final WordRepository wordRepository;

	public WordService(WordRepository wordRepository) 
	{
		this.wordRepository = wordRepository;
	}
	
	public Word randomWord()
	{
		List<Word> words = wordRepository.findAll();
		Word randomWord = words.get(new Random().nextInt(words.size()));
		return randomWord;
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
            if (wordRepository.findByValue(value).isEmpty()) {
                wordRepository.save(new Word(value));
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
