package com.example.kmebackend.model.dto

import com.example.kmebackend.model.RestId
import com.example.kmebackend.model.RestType

data class RestDTO(
    val restId: RestId,
    val restType: RestType,
    val position: Int,
    val metadataJson: String,
)