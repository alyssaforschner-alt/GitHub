package de.dhbw.stuttgart.test2.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import de.dhbw.stuttgart.test2.model.Game;
import de.dhbw.stuttgart.test2.model.Status;
import de.dhbw.stuttgart.test2.service.GameService;
import de.dhbw.stuttgart.test2.service.WordService;

@RestController
@RequestMapping("/api/games")

public class GameController 
{
	private final GameService gameService;
	private final WordService wordService;

	public GameController(GameService gameService, WordService wordService) 
	{
		this.gameService = gameService;
		this.wordService = wordService;
	}
	
	
//	@PostMapping("/start")
//	public Game startGame(@RequestParam Long userID, @RequestParam boolean multiplayer)
//	{
//		Game game;
//		
//		if(!multiplayer)
//		{
//			game = gameService.startSingleGame(userID);
//		}
//		else game = gameService.startMultiGame(userID);
//		return game;
//	}
	
	@PostMapping("/start/singlegame")
	public Game startGame(@RequestParam Long userID)
	{
		return gameService.startSingleGame(userID);
	}
	
	@PostMapping("/invite")
	public Game invite(@RequestParam Long userID, @RequestParam String username2) 
	{
		Game game;
		game = gameService.invite(userID, username2);
		return game;
	}
	
	@GetMapping("/check_invite")
	public Game invite(@RequestParam Long userID) 
	{
		Game game;
		game = gameService.checkInvitation(userID);
		return game;
	}
	
	@GetMapping("/check")
	public Game check(@RequestParam Long gameID)
	{
		Game game;
		
		game = gameService.check(gameID);
		return game;
		
	
		
//		if(game.getGameID() == 0l) return game; 
//		
//		if(game.getStatus() == Status.INVITED && game.getUser2ID() == 0l) return game; //user1
//		
//		if()//user2
//			return gameService.startMultiGame(userID);		
	}
	
	@PostMapping("/accept")
	public Game accept(@RequestParam String answer, @RequestParam Long gameID) 
	{
		Game game;
		//if(answer.equalsIgnoreCase("decline")) game = gameService.decline(gameID);
		game = gameService.accept(gameID, answer);
		return game; 
	} 
	
	@PostMapping("/guess")
	public ResponseEntity<?> checkGuess(@RequestParam String guess, @RequestParam Long gameID, @RequestParam Long userID)
	{
		
		try 
		{
			Game game;
			game = gameService.checkGuess(guess, gameID, userID);
			return ResponseEntity.ok(game);
		} 
		catch (IllegalArgumentException e) 
		{
			return ResponseEntity
	                .status(HttpStatus.NOT_FOUND)
	                .body("404 - word does not exist");
		} 
		catch (Exception e) 
		{
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Unexpected error: " + e.getMessage());
	    }
		
	}
	
    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public int importWords(@RequestBody List<String> words) {
        return wordService.importWords(words);
    }
	
	//add logic who is winner who is loser? in param userid?
	//add max guess = 6
	//polling? is it check?

//	@PutMapping("/end/{id}")
}
