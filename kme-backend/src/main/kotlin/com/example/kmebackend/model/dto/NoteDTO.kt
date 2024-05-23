package com.example.kmebackend.model.dto

import com.example.kmebackend.model.Accidental
import com.example.kmebackend.model.NoteId
import com.example.kmebackend.model.NoteMetadata

data class NoteDTO(
    val noteId: NoteId,
    val accidental: Accidental,
    val metadata: NoteMetadata,
)