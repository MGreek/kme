package com.example.kmebackend.model.dto

import com.example.kmebackend.model.Accidental

data class NoteDTO(
    val position: Int,
    val accidental: Accidental,
    val metadata: String?,
)