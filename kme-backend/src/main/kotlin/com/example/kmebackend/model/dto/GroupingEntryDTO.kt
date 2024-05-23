package com.example.kmebackend.model.dto

import com.example.kmebackend.model.GroupingEntryId
import com.fasterxml.jackson.annotation.JsonProperty

data class GroupingEntryDTO(
    val groupingEntryId: GroupingEntryId,
    val groupingEntriesOrder: Int,
    @JsonProperty("rest")
    val restDTO: RestDTO?,
    @JsonProperty("chord")
    val chordDTO: ChordDTO?,
)