package com.example.kmebackend.model.dto

import com.example.kmebackend.model.VoiceId
import com.example.kmebackend.model.VoiceMetadata
import com.fasterxml.jackson.annotation.JsonProperty

data class VoiceDTO(
    val voiceId: VoiceId,
    val metadata: VoiceMetadata,
    @JsonProperty("groupings")
    val groupingDTOs: List<GroupingDTO>,
)