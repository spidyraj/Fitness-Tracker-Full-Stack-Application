package com.fitnesstracker.monolith.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;

@Configuration
public class ConditionalServiceConfig {

    @Bean
    @ConditionalOnProperty(name = "spring.data.mongodb.uri", matchIfMissing = false)
    public ReactiveMongoTemplate reactiveMongoTemplate() {
        // This bean will only be created if MongoDB URI is provided
        return null;
    }
}
