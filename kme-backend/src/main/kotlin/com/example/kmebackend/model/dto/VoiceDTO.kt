package com.example.kmebackend.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class VoiceDTO(
    val voicesOrder: Int,
    val metadata: String?,
    @JsonProperty("groupings")
    val groupingDTOs: List<GroupingDTO>,
)