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
@RequestMapping("/api/word-pool")
public class RandomWordController {

    private final RandomWordService service;

    public RandomWordController(RandomWordService service) {
        this.service = service;
    }

    @GetMapping("/random")
    public WordResponse randomWord() {
        return new WordResponse(service.randomWordValue());
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public int importWords(@RequestBody List<String> words) {
        return service.importWords(words);
    }

    public record WordResponse(String word) {
    }
}
