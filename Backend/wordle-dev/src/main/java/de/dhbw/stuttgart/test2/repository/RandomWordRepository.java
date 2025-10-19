package de.dhbw.stuttgart.test2.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import de.dhbw.stuttgart.test2.model.RandomWord;

public interface RandomWordRepository extends JpaRepository<RandomWord, Long> {

    @Query(value = "SELECT * FROM random_word ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<RandomWord> findRandom();

    Optional<RandomWord> findByValue(String value);
}
