package de.dhbw.stuttgart.test2.service;

import org.springframework.stereotype.Service;

import de.dhbw.stuttgart.test2.model.Login;
import de.dhbw.stuttgart.test2.model.User;
import de.dhbw.stuttgart.test2.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService 
{
	private final UserRepository userRepository;
	
	private PasswordEncoder passwordEncoder; 
	
	public UserService(UserRepository userRepository) 
	{
		this.userRepository = userRepository;
	}

	public User register(Login login)
	{ 
		 
		//return new User(1, "lera");
		passwordEncoder = new BCryptPasswordEncoder();
		String hashed = passwordEncoder.encode(login.getPassword());
		User newUser = new User(login.getUsername(), hashed);
		
        return userRepository.save(newUser); // automatically inserts into DB
	}
	
	public User login(Login login)
	{

		User user = userRepository.findByUsername(login.getUsername());
		passwordEncoder = new BCryptPasswordEncoder();
		
		if (user == null) 
		{
		    return null; 
		}
		
		if (passwordEncoder.matches(login.getPassword(), user.getPassword())) 
		{
		    return user;
		}
		
		return null;
	}
}
