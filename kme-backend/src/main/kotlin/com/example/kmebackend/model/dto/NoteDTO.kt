package com.example.kmebackend.model.dto

import com.example.kmebackend.model.Accidental
import com.example.kmebackend.model.NoteMetadata

data class NoteDTO(
    val position: Int,
    val accidental: Accidental,
    val metadata: NoteMetadata,
)