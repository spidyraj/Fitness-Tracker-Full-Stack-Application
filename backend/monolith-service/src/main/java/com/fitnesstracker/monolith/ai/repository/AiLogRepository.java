package com.fitnesstracker.monolith.ai.repository;

import com.fitnesstracker.monolith.ai.entity.AiLogEntity;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface AiLogRepository extends ReactiveMongoRepository<AiLogEntity, String> {
    Flux<AiLogEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
