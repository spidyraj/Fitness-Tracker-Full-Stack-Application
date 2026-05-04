package com.fitnesstracker.ai.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.scheduling.annotation.EnableAsync;

import java.time.Duration;

/**
 * Configures Redis caching for AI responses and enables async processing.
 *
 * Interview talking point: "Why cache AI responses?"
 * → Groq has rate limits (free tier: 30 req/min). Caching prevents redundant API calls
 *   for identical prompts from the same user, reducing cost and latency dramatically.
 *
 * Interview talking point: "Why @EnableAsync?"
 * → Allows background AI tasks (daily coaching, recommendations) to run on a separate
 *   thread pool without blocking the HTTP response thread.
 */
@Configuration
@EnableCaching
@EnableAsync
public class AiConfig {

    /**
     * AI response cache: expires after 1 hour to keep advice fresh.
     * Uses JSON serialization so cached values are human-readable in Redis.
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                )
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withCacheConfiguration("ai-responses",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofHours(1)))
                .build();
    }
}
