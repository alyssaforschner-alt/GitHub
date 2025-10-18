package de.dhbw.stuttgart.test2.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController 
{
	@GetMapping("/api/hello")//first API endpoint
	public String sayHello()
	{
		return "Hello from Spring Boot!";
	}
}
