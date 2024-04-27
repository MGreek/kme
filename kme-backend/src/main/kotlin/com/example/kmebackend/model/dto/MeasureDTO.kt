package com.example.kmebackend.model.dto

import com.example.kmebackend.model.Clef
import com.example.kmebackend.model.KeySignature
import com.example.kmebackend.model.MeasureMetadata
import com.example.kmebackend.model.TimeSignature
import com.fasterxml.jackson.annotation.JsonProperty

data class MeasureDTO(
    val metadata: MeasureMetadata,
    val keySignature: KeySignature,
    val timeSignature: TimeSignature,
    val clef: Clef,
    @JsonProperty("voices")
    val voiceDTOs: List<VoiceDTO>,
)