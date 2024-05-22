package com.example.kmebackend.model.dto

import com.example.kmebackend.model.VoiceId
import com.fasterxml.jackson.annotation.JsonProperty

data class VoiceDTO(
    val voiceId: VoiceId,
    val metadataJson: String,
    @JsonProperty("groupings")
    val groupingDTOs: List<GroupingDTO>,
)