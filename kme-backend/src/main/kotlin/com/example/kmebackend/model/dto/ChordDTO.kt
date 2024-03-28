package com.example.kmebackend.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class ChordDTO(
    @JsonProperty("stem")
    val stemDTO: StemDTO,
    val dotCount: Long,
    val metadata: String?,
    @JsonProperty("notes")
    val noteDTOs: List<NoteDTO>,
)
