package com.example.kmebackend.model.dto

import com.example.kmebackend.model.ChordId
import com.fasterxml.jackson.annotation.JsonProperty

data class ChordDTO(
    val chordId: ChordId,
    @JsonProperty("stem")
    val stemDTO: StemDTO,
    val dotCount: Long,
    val metadataJson: String,
    @JsonProperty("notes")
    val noteDTOs: List<NoteDTO>,
)