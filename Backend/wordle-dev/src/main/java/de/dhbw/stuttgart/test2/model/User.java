package de.dhbw.stuttgart.test2.model;

import jakarta.persistence.Id;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

@Entity //tells Spring this class represents a table.
@Table(name = "users") //connects it to the existing table named users in your H2 DB.
public class User 
{
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private long userID;
	
	@Column(name = "username")//maps the field to the column name in that table.
	private String username;
	
	@Column(name = "password")
	@JsonIgnore //This prevents the password from being serialized to JSON when you return User
    private String password;
	
	public User() {} // required by JPA

	public User(String username, String password) {

		this.username = username;
		this.password = password;
	}

	public long getUserID() {
		return userID;
	}

	public void setUserID(long userID) {
		this.userID = userID;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
	
	
}
