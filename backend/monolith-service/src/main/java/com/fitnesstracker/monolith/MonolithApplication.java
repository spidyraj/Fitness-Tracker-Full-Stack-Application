package com.fitnesstracker.monolith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoReactiveDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoReactiveAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

// v1.2.0 — Groq model migration to llama-3.1-8b-instant & descriptive error log extraction
@SpringBootApplication(exclude = {
    MongoAutoConfiguration.class, 
    MongoDataAutoConfiguration.class,
    MongoReactiveAutoConfiguration.class,
    MongoReactiveDataAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
@EntityScan("com.fitnesstracker.monolith.*.entity")
@EnableJpaRepositories("com.fitnesstracker.monolith.*.repository")
@EnableCaching
@EnableScheduling
public class MonolithApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonolithApplication.class, args);
    }
}
