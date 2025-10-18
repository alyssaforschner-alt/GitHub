package com.example.demo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RandomWordRepository extends JpaRepository<RandomWord, Long> {

    @Query(value = "SELECT * FROM word_pool ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<RandomWord> findRandom();

    Optional<RandomWord> findByValue(String value);
}
