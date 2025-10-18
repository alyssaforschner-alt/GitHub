package de.dhbw.stuttgart.test2.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.dhbw.stuttgart.test2.model.Login;
import de.dhbw.stuttgart.test2.model.User;
import de.dhbw.stuttgart.test2.service.UserService;

@RestController
@RequestMapping("/api/users")

public class UserController 
{
	private final UserService userService; // Declare dependency
	
	// Constructor injection
    public UserController(UserService userService) {
        this.userService = userService;
    }
	
//	@PostMapping("/register")
//	public ResponseEntity<?> register(@RequestBody User user)
//	{
//		userService.register(user);
//		return ResponseEntity.ok(game);
//	}
	@PostMapping("/login")
	public User login(@RequestBody Login login)
	{
		User user; // = new User(1, "abc");
		
		user = userService.login(login);
		if(user == null) 
		{
			user = userService.register(login);
			//TODO connect with db
			
		}
		return user;
	}
	
//	@PostMapping("/invite")
//	public ResponseEntity<String> invite(@PathVariable Long userID, @RequestParam String username)
//	{
//		return ResponseEntity.ok("Invitation sent");
//	}
//	
//	@PostMapping("/accept")
//	public ResponseEntity<String> accept(@PathVariable Long userID)
//	{
//		return ResponseEntity.ok("Invitation accepted");
//	}
}
