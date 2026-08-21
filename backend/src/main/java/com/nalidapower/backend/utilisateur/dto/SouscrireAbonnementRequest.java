package com.nalidapower.backend.utilisateur.dto;

import com.nalidapower.backend.utilisateur.model.TypeAbonnement;


public class SouscrireAbonnementRequest {

    private TypeAbonnement type;

    public TypeAbonnement getType() {
        return type;
    }

    public void setType(TypeAbonnement type) {
        this.type = type;
    }
}