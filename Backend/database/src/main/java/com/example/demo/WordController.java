package com.example.demo;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/words")
public class WordController {

    private final WordRepository repository;
    private final WordService service;

    public WordController(WordRepository repository, WordService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public List<Word> findAll() {
        return repository.findAll();
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public int importWords(@RequestBody List<String> words) {
        return service.importWords(words);
    }
}
