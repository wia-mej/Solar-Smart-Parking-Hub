package com.nalidapower.backend.prediction.repository;

import com.nalidapower.backend.prediction.model.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredictionRepository extends MongoRepository<Prediction, String> {
}