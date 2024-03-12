package com.example.kmebackend.service

import com.example.kmebackend.repository.NoteRepository
import org.springframework.stereotype.Service

@Service
data class NoteService(
    val noteRepository: NoteRepository,
)
