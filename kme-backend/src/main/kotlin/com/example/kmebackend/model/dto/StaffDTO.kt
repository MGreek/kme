package com.example.kmebackend.model.dto

import com.example.kmebackend.model.StaffMetadata
import com.fasterxml.jackson.annotation.JsonProperty

data class StaffDTO(
    val metadata: StaffMetadata,
    @JsonProperty("measures")
    val measureDTOs: List<MeasureDTO>,
)