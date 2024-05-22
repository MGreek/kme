package com.example.kmebackend.model.dto

import com.example.kmebackend.model.*
import com.fasterxml.jackson.annotation.JsonProperty

data class MeasureDTO(
    val measureId: MeasureId,
    val metadataJson: String,
    val keySignature: KeySignature,
    val timeSignature: TimeSignature,
    val clef: Clef,
    @JsonProperty("voices")
    val voiceDTOs: List<VoiceDTO>,
)