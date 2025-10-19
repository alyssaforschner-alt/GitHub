package de.dhbw.stuttgart.test2.service;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import de.dhbw.stuttgart.test2.model.Game;
import de.dhbw.stuttgart.test2.model.Status;
import de.dhbw.stuttgart.test2.model.User;
import de.dhbw.stuttgart.test2.model.Word;
import de.dhbw.stuttgart.test2.repository.GameRepository;
import de.dhbw.stuttgart.test2.repository.UserRepository;
import de.dhbw.stuttgart.test2.repository.WordRepository;


@Service
public class GameService 
{
	private final GameRepository gameRepository;
    private final WordService wordService;
    private final UserRepository userRepository; 
    private final WordRepository wordRepository;

    // Spring automatically injects both beans
    public GameService(GameRepository gameRepository, WordService wordService, UserRepository userRepository, WordRepository wordRepository) {
        this.gameRepository = gameRepository;
        this.wordService = wordService;
        this.userRepository = userRepository;
        this.wordRepository = wordRepository;
    }

	//start the game
	public Game startSingleGame(Long userID)
	{
		Game game = new Game();
		game.setWord(wordService.randomWord().getValue());
		game.setUser1ID(userID);
		game.setStatus(Status.GAME_ON);
		return gameRepository.save(game);
	}

	
//	public Long invitation(String username)
//	{
//		User user = userRepository.findByUsername(username);
//		if(user != null) return user.getUserID();
//		return 0l;
//	}
	
	public Game invite(Long user1ID, String username2)
	{
		Game game = new Game();
		
		User user = userRepository.findByUsername(username2);
		if(user != null) 
		{
			game.setUser2ID(user.getUserID());
			game.setUser1ID(user1ID);
			game.setStatus(Status.INVITED);
			gameRepository.save(game);
			return game;
		}
		game.setUser1ID(user1ID);
		game.setStatus(Status.NOT_FOUND);
		return game;
		//if after invitation game comes with user2ID = 0 -> user not found - realization in frontend
	}

	public Game check(Long gameID) 
	{
		if(gameID == 0l) return null; 
		
		Game game = gameRepository.findByGameID(gameID);
		
		if(game.getStatus().equals(Status.ACCEPTED))
		{
			game = startMultiGame(game);
		}
		return gameRepository.save(game);
	}
	
	public Game startMultiGame(Game game)
	{
		game.setWord("apple");
		//game.setWord(wordService.randomWord().getValue());
		game.setStatus(Status.GAME_ON);
		return game;
	}
	
	public Game checkInvitation(Long userID)
	{
		Game game = gameRepository.findByUser2IDAndStatus(userID, Status.INVITED);
		return game;
	}
	
	public Game accept(Long gameID, String answer) {
	    Game game = gameRepository.findById(gameID)
	        .orElseThrow(() -> new IllegalArgumentException("Game not found"));
	    
	    if(answer.equalsIgnoreCase("decline")) game.setStatus(Status.DECLINED);
	    else game.setStatus(Status.ACCEPTED);
	  //game.setWord(wordService.randomWord().getValue());
	    return gameRepository.save(game);  // persist changes
	}
	
//	public Game decline(Long gameID)
//	{
//    Game game = gameRepository.findById(gameID)
//            .orElseThrow(() -> new IllegalArgumentException("Game not found"));
//
//        game.setStatus(Status.DECLINED);
//        return gameRepository.save(game);
//	}

	public Game checkGuess(String guess, Long gameID, Long userID) 
	{
		String who;
		if(gameRepository.findByUser2IDAndStatus(userID, Status.GAME_ON) != null)
		{
			who = "2";
		}
		else who = "1";
		
		Game game = gameRepository.findByGameID(gameID);
		final int maxGuess = 6;
		
		//check if its a real word
		Word existing = wordRepository.findByValue(guess.toLowerCase()).orElse(null);

		if (existing == null) {
		    throw new IllegalArgumentException("Word not in dictionary!");
		}
		
		//check if its the correct guess
		if(guess.toLowerCase().equals(game.getWord())) 
		{
			game.setWinnerUserID(userID);
			String feedbackString = guess + ":" + new String("GGGGG");
			game.setGuessesUser1(feedbackString);
			game.setStatus(Status.GAME_OVER);
			return gameRepository.save(game);
		}
		
		//check if a letter is in the word & the position of the letter
	    String target = game.getWord().toLowerCase();
	    guess = guess.toLowerCase();

	    char[] feedback = new char[target.length()];
	    for (int i = 0; i < target.length(); i++) {
	        if (guess.charAt(i) == target.charAt(i)) {
	            feedback[i] = 'G';//Green - correct position
	        } else if (target.contains(String.valueOf(guess.charAt(i)))) {
	            feedback[i] = 'Y';//Yellow - correct letter, wrong position
	        } else {
	            feedback[i] = '-';//Gray - not in word
	        }
	    }

	    
	    String feedbackString = guess + ":" + new String(feedback);
	    
	    // increment guess count
	    //save guess + feedback comma-separated: "apple:G--Y-,grape:YGG--"

	    if(who.equals("1"))
	    {
	    	
		    if (game.getGuessesUser1() == null || game.getGuessesUser1().isEmpty()) {
		        game.setGuessesUser1(feedbackString);
		    } else {
		        game.setGuessesUser1(game.getGuessesUser1() + "," + feedbackString);
		    }
	    	game.setGuessCount1(game.getGuessCount1() + 1);
		    // check if player used all guesses
		    if (game.getGuessCount1() >= maxGuess) {
		       
		       game.setStatus(Status.GAME_OVER); // optional
		       game.setWinnerUserID(game.getUser2ID());
		    }
	    }
	    else 
	    {
	    	if (game.getGuessesUser2() == null || game.getGuessesUser2().isEmpty()) {
		        game.setGuessesUser2(feedbackString);
		    } else {
		        game.setGuessesUser2(game.getGuessesUser2() + "," + feedbackString);
		    }
	    	game.setGuessCount2(game.getGuessCount2() + 1);
		    // check if player used all guesses
		    if (game.getGuessCount2() >= maxGuess) {
		       
		       game.setStatus(Status.GAME_OVER); // optional
		       game.setWinnerUserID(game.getUser1ID());
		    }
		}
	    


	    return gameRepository.save(game);
		
	}
	

	
//	public Game accept(Long gameID) 
//	{
//		Game game = gameRepository.findByGameID(gameID);
//		game.setWord(wordService.randomWord().getValue());
//		game.setStatus(Status.ACCEPTED);
//		return game;
//	}

//	public Game decline(Long gameID) 
//	{
//		Game game = gameRepository.findByGameID(gameID);
//		game.setStatus(Status.DECLINED);
//		gameRepository.deleteById(gameID);
//		return null;
//	}
	
}
