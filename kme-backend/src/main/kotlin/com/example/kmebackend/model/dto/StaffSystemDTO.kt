package com.example.kmebackend.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class StaffSystemDTO(
    val id: String,
    val metadata: String?,
    @JsonProperty("staves")
    val staffDTOs: List<StaffDTO>,
)