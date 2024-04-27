package com.example.kmebackend.model.dto

import com.example.kmebackend.model.ChordMetadata
import com.fasterxml.jackson.annotation.JsonProperty

data class ChordDTO(
    @JsonProperty("stem")
    val stemDTO: StemDTO,
    val dotCount: Long,
    val metadata: ChordMetadata,
    @JsonProperty("notes")
    val noteDTOs: List<NoteDTO>,
)