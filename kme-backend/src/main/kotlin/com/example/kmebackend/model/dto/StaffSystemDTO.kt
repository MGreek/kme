package com.example.kmebackend.model.dto

import com.example.kmebackend.model.StaffSystemId
import com.fasterxml.jackson.annotation.JsonProperty

data class StaffSystemDTO(
    val staffSystemId: StaffSystemId,
    val metadataJson: String,
    @JsonProperty("staves")
    val staffDTOs: List<StaffDTO>,
)