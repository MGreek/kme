package com.example.kmebackend.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class GroupingDTO(
    val groupingsOrder: Int,
    val metadata: String?,
    @JsonProperty("groupingEntries")
    val groupingEntryDTOs: List<GroupingEntryDTO>,
)
