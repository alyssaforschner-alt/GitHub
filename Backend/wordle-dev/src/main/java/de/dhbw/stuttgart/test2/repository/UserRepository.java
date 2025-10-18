package de.dhbw.stuttgart.test2.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import de.dhbw.stuttgart.test2.model.User;

public interface UserRepository extends JpaRepository<User, Long>
{
	User findByUsername(String username);
	//User save(User user);
}
