package com.example.kmebackend.model.dto

import com.example.kmebackend.model.RestType

data class RestDTO(
    val restType: RestType,
    val metadata: String?,
)
