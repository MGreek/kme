package com.example.kmebackend.service

import com.example.kmebackend.repository.ChordRepository
import org.springframework.stereotype.Service

@Service
data class ChordService(
    val chordRepository: ChordRepository,
)
