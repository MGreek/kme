package com.example.kmebackend.model.dto

import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.model.StaffSystemMetadata
import com.fasterxml.jackson.annotation.JsonProperty

data class StaffSystemDTO(
    val staffSystemId: StaffSystemId,
    val metadata: StaffSystemMetadata,
    @JsonProperty("staves")
    val staffDTOs: List<StaffDTO>,
)