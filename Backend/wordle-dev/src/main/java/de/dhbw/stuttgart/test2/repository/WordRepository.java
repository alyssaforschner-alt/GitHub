package de.dhbw.stuttgart.test2.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import de.dhbw.stuttgart.test2.model.Word;

public interface WordRepository extends JpaRepository<Word, Long>{

	List<Word> findAll();
	//Word findByValue(String value);
	Optional<Word> findByValue(String value);

}
