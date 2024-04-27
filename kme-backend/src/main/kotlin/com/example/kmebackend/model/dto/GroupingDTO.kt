package com.example.kmebackend.model.dto

import com.example.kmebackend.model.GroupingMetadata
import com.fasterxml.jackson.annotation.JsonProperty

data class GroupingDTO(
    val metadata: GroupingMetadata,
    @JsonProperty("groupingEntries")
    val groupingEntryDTOs: List<GroupingEntryDTO>,
)