package com.example.kmebackend.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class GroupingEntryDTO(
    val groupingEntriesOrder: Int,
    @JsonProperty("rest")
    val restDTO: RestDTO?,
    @JsonProperty("chord")
    val chordDTO: ChordDTO?,
)
