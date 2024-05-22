package com.example.kmebackend.model.dto

import com.example.kmebackend.model.Accidental
import com.example.kmebackend.model.NoteId

data class NoteDTO(
    val noteId: NoteId,
    val accidental: Accidental,
    val metadataJson: String,
)