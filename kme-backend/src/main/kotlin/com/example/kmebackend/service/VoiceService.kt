package com.example.kmebackend.service

import com.example.kmebackend.repository.VoiceRepository
import org.springframework.stereotype.Service

@Service
data class VoiceService(
    val voiceRepository: VoiceRepository,
)
