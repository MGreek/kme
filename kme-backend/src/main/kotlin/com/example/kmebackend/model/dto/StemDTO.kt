package com.example.kmebackend.model.dto

import com.example.kmebackend.model.StemType

data class StemDTO(
    val stemType: StemType,
    val metadata: String?,
)
