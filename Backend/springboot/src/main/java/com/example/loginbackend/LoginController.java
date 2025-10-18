package com.example.loginbackend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LoginController {

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> payload) {
        if (payload == null || !payload.containsKey("username") || !payload.containsKey("password")) {
            return ResponseEntity.badRequest().body("Missing username or password");
        }
        // Do not store anything, just acknowledge
        return ResponseEntity.ok("ok");
    }
}
