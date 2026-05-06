package com.fitnesstracker.monolith.nutrition.repository;

import com.fitnesstracker.monolith.nutrition.entity.FoodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<FoodEntity, Long> {

    @Query("SELECT f FROM FoodEntity f WHERE " +
           "LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.cuisine) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.brand) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<FoodEntity> searchFoods(@Param("search") String search);

    @Query("SELECT DISTINCT f.cuisine FROM FoodEntity f WHERE f.cuisine IS NOT NULL ORDER BY f.cuisine")
    List<String> findAllCuisines();

    @Query("SELECT f FROM FoodEntity f WHERE (:cuisine IS NULL OR f.cuisine = :cuisine) AND " +
           "(LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) OR :search IS NULL OR :search = '')")
    List<FoodEntity> findByCuisineAndName(@Param("cuisine") String cuisine, @Param("search") String search);
}
