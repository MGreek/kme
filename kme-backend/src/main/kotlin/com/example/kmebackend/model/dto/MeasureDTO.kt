package com.example.kmebackend.model.dto

import com.example.kmebackend.model.Clef
import com.example.kmebackend.model.KeySignature
import com.example.kmebackend.model.TimeSignature
import com.fasterxml.jackson.annotation.JsonProperty

data class MeasureDTO(
    val measuresOrder: Int,
    val metadata: String?,
    val keySignature: KeySignature,
    val timeSignature: TimeSignature,
    val clef: Clef,
    @JsonProperty("voices")
    val voiceDTOs: List<VoiceDTO>,
)