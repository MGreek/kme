package com.example.kmebackend.model.dto

import com.example.kmebackend.model.StaffId
import com.fasterxml.jackson.annotation.JsonProperty

data class StaffDTO(
    val staffId: StaffId,
    val metadataJson: String,
    @JsonProperty("measures")
    val measureDTOs: List<MeasureDTO>,
)