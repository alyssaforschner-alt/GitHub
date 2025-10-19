package de.dhbw.stuttgart.test2.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import de.dhbw.stuttgart.test2.model.Game;
import de.dhbw.stuttgart.test2.model.Status;
import de.dhbw.stuttgart.test2.model.User;

public interface GameRepository extends JpaRepository<Game, Long>
{
	Game findByGameID(Long gameID);
	Game findByUser2ID(Long userID);
	Game findByUser2IDAndStatus(Long userID, Status status);
}
