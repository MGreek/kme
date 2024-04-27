package com.example.kmebackend.model.dto

import com.example.kmebackend.model.VoiceMetadata
import com.fasterxml.jackson.annotation.JsonProperty

data class VoiceDTO(
    val metadata: VoiceMetadata,
    @JsonProperty("groupings")
    val groupingDTOs: List<GroupingDTO>,
)