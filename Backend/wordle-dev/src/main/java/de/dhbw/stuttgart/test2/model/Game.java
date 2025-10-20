package de.dhbw.stuttgart.test2.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "games")
public class Game 
{
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private long gameID;
	
	@Column(name = "user1")
	//@JsonIgnore
	private long user1ID;
	
	@Column(name = "user2")
	private long user2ID;
	
	@Column(name = "word")
	@JsonIgnore
	private String word;
	
	@Column(name = "guessesUser1")
	private String guessesUser1;
	
	@Column(name = "guessesUser2")
	private String guessesUser2;
	
	@Column(name = "guessCount1")
	private int guessCount1;
	
	@Column(name = "guessCount2")
	private int guessCount2;
	
	@Column(name = "winner")
	private Long winnerUserID;
	
	@Column(name = "guessWord")
	private String guessWord;
	
//	@Column(name = "invitationAccepted")
//	private boolean invitationAccepted;
	

	

	@Enumerated(EnumType.STRING)
	@Column(name = "status")
	private Status status;
	
	
	public String getGuessesUser1() {
		return guessesUser1;
	}

	public void setGuessesUser1(String guessesUser1) {
		this.guessesUser1 = guessesUser1;
	}

	public String getGuessesUser2() {
		return guessesUser2;
	}

	public void setGuessesUser2(String guessesUser2) {
		this.guessesUser2 = guessesUser2;
	}

	public Game() {}

	public long getGameID() {
		return gameID;
	}

	public void setGameID(long gameID) {
		this.gameID = gameID;
	}

	public long getUser1ID() {
		return user1ID;
	}

	public void setUser1ID(long user1id) {
		user1ID = user1id;
	}

	public long getUser2ID() {
		return user2ID;
	}

	public void setUser2ID(long user2id) {
		user2ID = user2id;
	}

	public String getWord() {
		return word;
	}

	public void setWord(String word) {
		this.word = word;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public int getGuessCount1() {
		return guessCount1;
	}

	public void setGuessCount1(int guessCount1) {
		this.guessCount1 = guessCount1;
	}

	public int getGuessCount2() {
		return guessCount2;
	}

	public void setGuessCount2(int guessCount2) {
		this.guessCount2 = guessCount2;
	}

	public Long getWinnerUserID() {
		return winnerUserID;
	}

	public void setWinnerUserID(Long winnerUserID) {
		this.winnerUserID = winnerUserID;
	}

	public String getGuessWord() {
		return status.equals(Status.GAME_OVER) ? word : null;
	}

	public void setGuessWord(String guessWord) {
		this.guessWord = guessWord;
	}
	
	
	
	
}
