package com.example.kmebackend.model.dto

import com.example.kmebackend.model.GroupingId
import com.fasterxml.jackson.annotation.JsonProperty

data class GroupingDTO(
    val groupingId: GroupingId,
    val metadataJson: String,
    @JsonProperty("groupingEntries")
    val groupingEntryDTOs: List<GroupingEntryDTO>,
)