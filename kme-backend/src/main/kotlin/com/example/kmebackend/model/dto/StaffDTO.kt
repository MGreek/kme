package com.example.kmebackend.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class StaffDTO(
    val stavesOrder: Int,
    val metadata: String?,
    @JsonProperty("measures")
    val measureDTOs: List<MeasureDTO>,
)
