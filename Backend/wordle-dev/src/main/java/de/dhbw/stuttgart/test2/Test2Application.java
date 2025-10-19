package de.dhbw.stuttgart.test2;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import de.dhbw.stuttgart.test2.repository.WordRepository;
import de.dhbw.stuttgart.test2.repository.RandomWordRepository;

@SpringBootApplication
public class Test2Application {

	public static void main(String[] args) {
		SpringApplication.run(Test2Application.class, args);
	}
	
	@Bean
    CommandLineRunner check(WordRepository repo) {
        return args -> System.out.println("Wörter in DB: " + repo.count());
    }
	
	@Bean
    CommandLineRunner checkRandom(RandomWordRepository repo) {
        return args -> System.out.println("Random-Wörter in DB: " + repo.count());
    }
}
