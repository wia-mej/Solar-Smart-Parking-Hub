package com.nalidapower.backend.productionenergie.repository;

import com.nalidapower.backend.productionenergie.model.ProductionEnergie;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductionEnergieRepository extends MongoRepository<ProductionEnergie, String> {
}